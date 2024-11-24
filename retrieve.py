import gzip
import urllib.request as request
import csv
from locator import Locator
import argparse
import sys
import json
import time


class Counter(Locator):
    def __init__(self, reffile):
        Locator.__init__(self, reffile=reffile)  # call parent class constructor
        self.lineages = {}  # store mutation counts and genome count per lineage
        self.mutations = {}  # store global mutation counts and amino acid info
        self.missing = {}

    def update_counts(self, coord1, alt, lineage):
        if coord1 not in self.mutations:
            self.mutations.update({coord1: {}})
        if alt not in self.mutations[coord1]:
            self.mutations[coord1].update({alt: {'count': 0, 'context': {}}})
        self.mutations[coord1][alt]['count'] += 1

        if coord1 not in self.lineages[lineage]['mutations']:
            self.lineages[lineage]['mutations'].update({coord1: {}})
        if alt not in self.lineages[lineage]['mutations'][coord1]:
            self.lineages[lineage]['mutations'][coord1].update({alt: 0})
        self.lineages[lineage]['mutations'][coord1][alt] += 1

    def update_context(self, coord1, alt, aminos):
        """ attempt to match nucleotide sub to amino acid sub """
        amino_pos = [int(a.split(':')[-1][1:-1]) for a in aminos if a != '']
        if not alt.startswith('del') or not alt.startswith('ins'):
            gene, aa_ref, aa_pos1, aa_alt = self.parse_mutation(coord1, alt)
            if aa_alt is not None:
                aasub = f"{gene}:{aa_ref}{aa_pos1}{aa_alt}"
                if aasub not in aminos:
                    # this is likely caused by multiple mutations in the codon
                    if aa_pos1 in amino_pos:
                        aasub = aminos[amino_pos.index(aa_pos1)]
                    else:
                        key = (coord1, alt, aasub)
                        if key not in self.missing:
                            self.missing.update({key: 0})
                        self.missing[key] += 1

                if aasub not in self.mutations[coord1][alt]['context']:
                    self.mutations[coord1][alt]['context'].update({aasub: 0})
                self.mutations[coord1][alt]['context'][aasub] += 1

    def parse_stream(self, stream, verbose=False):
        """
        :param stream: str/urlopen return value
        :param verbose: if True, print progress messages to console
        :return: None
        """
        self.missing = {}  # reset tracker
        rows = csv.DictReader(gzip.open(stream, 'rt'), delimiter='\t')
        for ln, row in enumerate(rows):
            if args.limit and ln > args.limit:
                break
            if verbose and ln % 10000 == 0:
                sys.stderr.write(f"Processed {ln} lines\n")

            lineage = row['pango_lineage']
            if lineage == '?' or lineage.strip() == '':
                continue

            # TODO: track range of collection dates (min, median, max) per lineage
            try: 
                coldate = time.strptime(row['date'], '%Y-%m-%d')
            except ValueError:
                continue

            if lineage not in self.lineages:
                self.lineages.update({lineage: {'mutations': {}, 'total': 0, 'earliest_coldate': coldate, 'latest_coldate': coldate}})
            self.lineages[lineage]['total'] += 1  # track number of sequences in lineage

            if coldate < self.lineages[lineage]['earliest_coldate']:
                self.lineages[lineage]['earliest_coldate'] = coldate
            
            if coldate > self.lineages[lineage]['earliest_coldate']:
                self.lineages[lineage]['latest_coldate'] = coldate

            # 22194-22196,28362-28370
            for deletion in row['deletions'].split(','):
                if deletion == '':
                    continue  # no deletions

                if '-' in deletion:
                    coord1, alt = [int(x) for x in deletion.split('-')]
                    alt = alt - coord1 + 1
                else:
                    coord1 = int(deletion)  # probably a single base deletion
                    alt = 1
                alt = f"del{alt}"
                self.update_counts(coord1, alt, lineage)

            # 22204:GAGCCAGAA
            for insert in row['insertions'].split(','):
                if insert == '':
                    continue  # no insertions
                coord1, alt = insert.split(':')
                if coord1 == '0':
                    continue # incomplete sequences
                coord1 = int(coord1)
                alt = f"ins{alt}"
                self.update_counts(coord1, alt, lineage)

            # TODO: associate nucleotide and amino acid substitutions, record as (nt, aa)
            # TODO: this matching should be cached for rapid lookup
            nuc_muts = row['substitutions'].split(',')  # C241T,A2832G,C3037T
            aminos = row['aaSubstitutions'].split(',')  # M:I82T,ORF1a:K856R,ORF1a:L2084I

            for nuc in nuc_muts:
                if nuc == '':
                    continue  # no substitutions!
                coord1 = int(nuc[1:-1])  # 1-index genome coordinate
                alt = nuc[-1]
                self.update_counts(coord1, alt, lineage)
                self.update_context(coord1, alt, aminos)

        # report missing entries
        sys.stderr.write("Non-synonymous mutations not found in metadata:\n")
        for mdata, mcount in self.missing.items():
            coord1, alt, aasub = mdata
            sys.stderr.write(f"{coord1}{alt}\t{aasub}\t\t{mcount} times\n")

    def write_json(self, handle, indent=None, min_count=None):
        """ Export mutation and lineage counts to JSON file """
        
        # Update the date format before writing JSON
        for lineage in self.lineages:
            self.lineages[lineage]['earliest_coldate'] = time.strftime('%Y-%m-%d', self.lineages[lineage]['earliest_coldate'])
            self.lineages[lineage]['latest_coldate'] = time.strftime('%Y-%m-%d', self.lineages[lineage]['latest_coldate'])
        
        # TODO: omit entries where count is below min_count threshold
        json.dump({'lineages': self.lineages, 'mutations': self.mutations},
                  handle, indent=indent)


if __name__ == '__main__':
    # command line interface
    parser = argparse.ArgumentParser()
    parser.add_argument("outfile", type=argparse.FileType('w'),
                        help="Path to write JSON output")
    parser.add_argument("--ref", type=str, help="Path to reference genome file",
                        default="data/NC_045512.txt")
    parser.add_argument("--url", type=str, help="URL to Nextstrain metadata TSV file",
                        default="https://data.nextstrain.org/files/ncov/open/metadata.tsv.gz")
    parser.add_argument("--indent", type=int, default=None,
                        help="Number of spaces to indent JSON entries (pretty output). "
                             "Defaults to None.")
    parser.add_argument("--local", type=str, default=None,
                        help="Path to local copy of metadata.tsv.gz; otherwise download from remote")
    parser.add_argument("--limit", type=float, default=None,
                        help="Maximum number of rows to process (debugging)")
    parser.add_argument("--mincount", type=int, default=None,
                        help="Minimum count of mutation to be written to JSON file. "
                             "Use to reduce file size.")
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="Display progress monitoring messages.")
    args = parser.parse_args()

    if args.local is None:
        # retrieve metadata from remote server
        stream = request.urlopen(args.url)
    else:
        stream = args.local

    counter = Counter(reffile=args.ref)
    counter.parse_stream(stream, verbose=args.verbose)
    counter.write_json(args.outfile, indent=args.indent)
