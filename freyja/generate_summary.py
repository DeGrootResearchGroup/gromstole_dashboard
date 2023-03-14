import argparse
import json
import sys


class LinParser:
    def __init__(self, alias_file, loi_file):
        self.alias = {}
        self.parse_alias_json(alias_file)
        self.loi = {}
        with open(loi_file) as handle:
            for line in handle:
                lname = line.strip()
                fullname = self.expand_lineage(lname)
                self.loi.update({fullname: lname})

    def parse_alias_json(self, jsonfile):
        """
        Parse PANGO alias_key.json file contents, excluding entries with empty string values.
        :param jsonfile:  str, path to JSON file
        """
        self.alias = {}  # reset dictionary
        with open(jsonfile, 'r') as handle:
            alias = json.loads(handle.read())
            for k, v in alias.items():
                if v != '':
                    self.alias.update({k: v})

    def parse_lin(self, tsvfile, threshold=0.01):
        """
        Extract lineage names and frequency estimates (abundances) from TSV file
        generated by Freyja.
        :param tsvfile:  str, path to Freyja lin.*.tsv file
        :param threshold:  float, lineage reporting threshold
        :return:
        """
        # parse sample name from TSV filename / path
        sample = os.path.basename(tsvfile).split('.')[1]

        lineages, estimates = None, None
        with open(tsvfile) as handle:
            for line in handle:
                if line.startswith("lineages"):
                    lineages = line.split('\t')[-1].strip().split(' ')
                elif line.startswith("abundances"):
                    estimates = line.split('\t')[-1].strip().split(' ')

        if not lineages or not estimates:
            sys.stderr.write(f"ERROR: Failed to parse TSV file {tsvfile}")
            sys.exit()

        results = []
        other = 0.
        for lname, est in zip(lineages, estimates):
            freq = float(est)
            if freq < threshold:
                other += freq
                continue

            # TODO: determine match in lineages of interest
            fullname = self.expand_lineage(lname)
            match = self.match_lineage(fullname)
            results.append({'sample': sample, 'name': lname, 'LOI': match, 'frequency': float(est)})

        # report sum of lineages below threshold
        results.append({'sample': sample, 'name': 'other', 'frequency': other})
        return results

    def match_lineage(self, fullname):
        if fullname in self.loi:
            return self.loi[fullname]

        while '.' in fullname:
            items = fullname.split('.')
            fullname = '.'.join(items[:-1])
            if fullname in self.loi:
                return self.loi[fullname]

        # no match in lineages of interest
        if fullname.startswith('X'):
            return 'Other recombinant'
        else:
            return 'Other'

    def expand_lineage(self, lname):
        """
        Use PANGO alias dictionary to resolve lineage names to full format.
        If given a recombinant lineage name, will return the unmodified string.
        :param lname:  str, PANGO lineage name
        :param alias:  dict, map of PANGO aliases
        :return:  str, resolved name
        """
        prefix = lname.split('.')[0]
        while prefix in self.alias and not prefix.startswith('X'):
            lname = lname.replace(prefix, self.alias[prefix])
            prefix = lname.split('.')[0]  # get next prefix
        return lname


if __name__ == '__main__':
    import csv
    import os
    from glob import glob

    parser = argparse.ArgumentParser(
        description="Generate summary file"
    )
    parser.add_argument('path', type=str,
                        help="input, directory containing Freyja outputs (lin.<sample>.tsv)")
    parser.add_argument('-o', '--outfile', type=argparse.FileType('w'), default=sys.stdout,
                        help="output, path to write CSV file; defaults to stdout")
    parser.add_argument('--loi', type=str, default="lineages_of_interest.txt",
                        help="input, path to text file listing lineages of interest")
    parser.add_argument('--alias', type=str, default="data/alias_key.json",
                        help="<input> PANGO aliases")
    args = parser.parse_args()

    parser = LinParser(args.alias, args.loi)
    files = glob(os.path.join(args.path, "lin.*.tsv"))
    if not files:
        sys.stderr.write(f"ERROR: Directory {args.path} does not contain any files matching lin.*.tsv\n")
        sys.exit(1)

    # prepare output file
    writer = csv.DictWriter(args.outfile,
                            fieldnames=['sample', 'name', 'LOI', 'frequency'])
    writer.writeheader()
    for infile in files:
        results = parser.parse_lin(infile)
        for row in results:
            writer.writerow(row)
