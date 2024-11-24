def load_vcf(vcf_file="data/problematic_sites_sarsCov2.vcf"):
    """
    Load VCF of problematic sites curated by Nick Goldman lab
    NOTE: The curators of this VCF used MN908947.3, which is identical to NC_045512.
    *** It is very important to check that your reference is compatible! ***
    TODO: align user's reference to NC_045512 to generate custom coordinate system

    :param vcf_file:  str, path to VCF file
    :return:  dict, tuples keyed by reference coordinate
    """
    vcf = open(vcf_file)
    mask = {}
    for line in vcf.readlines():
        if line.startswith('#'):
            continue
        try:
            _, pos, _, ref, alt, _, filt, info = line.strip().split('\t')
        except ValueError:
            raise
        if filt == 'mask':
            mask.update({int(pos)-1: {  # convert to 0-index
                'ref': ref, 'alt': alt, 'info': info}
            })
    return mask


def filter_problematic_sites(obj, mask, callback=None):
    """
    Apply problematic sites annotation from de Maio et al.,
    https://virological.org/t/issues-with-sars-cov-2-sequencing-data/473
    which are published and maintained as a VCF-formatted file.
    FIXME: this duplicates some functionality of filter_problematic(), #290

    :param obj:  list, entries are (1) dicts returned by import_json or (2) tuples
    :param mask:  dict, problematic site index from load_vcf()
    :param vcf_file:  str, path to VCF file
    :return:
    """
    # apply filters to feature vectors
    count = 0
    result = []
    for row in obj:
        if type(row) is dict:
            qname, diffs, missing = row['qname'], row['diffs'], row['missing']
        else:
            qname, diffs, missing = row  # unpack tuple

        filtered = []
        for typ, pos, alt in diffs:
            if typ == '~' and int(pos) in mask and alt in mask[pos]['alt']:
                continue
            if typ != '-' and 'N' in alt:
                # drop substitutions and insertions with uncalled bases
                continue
            filtered.append(tuple([typ, pos, alt]))

        count += len(diffs) - len(filtered)
        result.append([qname, filtered, missing])

    if callback:
        callback('filtered {} problematic features'.format(count))
    return result


class Locator:
    def __init__(self, reffile='data/NC_045512.txt'):
        self.gcode = {
            'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
            'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
            'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
            'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
            'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
            'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
            'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
            'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
            'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
            'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
            'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
            'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
            'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
            'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
            'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
            '---': '-', 'XXX': '?'
        }
        self.orfs = {
            'ORF1a': (265, 13468),    # overlap
            'ORF1b': (13467, 21555),  # ......p
            'S': (21562, 25384),
            'ORF3a': (25392, 26220),
            'E': (26244, 26472),
            'M': (26522, 27191),
            'ORF6': (27201, 27387),
            'ORF7a': (27393, 27759),  # overlap
            'ORF7b': (27755, 27887),  # ...rlap
            'ORF8': (27893, 28259),
            'N': (28273, 29533),
            'ORF10': (29557, 29674)
        }

        # load reference genome (NC_045512)
        self.refseq = ''
        with open(reffile) as handle:
            for line in handle:
                self.refseq += line.strip()

    def parse_mutation(self, pos, alt):
        """
        Map feature from reference nucleotide coordinate system to amino
        acid substitutions, if relevant.
        :param pos:  int, 1-index position of nucleotide in reference genome
        :param alt:  str, nucleotide substitution
        :return:  tuple, (orf, codon_pos, codon_alt)
        """
        pos -= 1  # convert to 0-index

        this_orf = None
        this_left, this_right = None, None
        # is substitution in this open reading frame?
        for orf, coords in self.orfs.items():
            left, right = coords
            if left <= pos < right:
                this_orf = orf
                this_left, this_right = left, right
                break  # FIXME: overlapping ORFs is an edgecase

        # does the mutation change an amino acid?
        if this_orf is None:
            return None, None, None, None

        # retrieve codons
        codon_left = 3 * ((pos-this_left)//3)  # nt coords
        codon_pos = (pos-this_left) % 3

        rcodon = self.refseq[this_left:this_right][codon_left:(codon_left+3)]
        ramino = self.gcode[rcodon]  # reference AA

        qcodon = list(rcodon)
        qcodon[codon_pos] = alt  # substitution
        qcodon = ''.join(qcodon)
        qamino = self.gcode[qcodon]  # query AA
        qpos = int(1+codon_left/3)
        if ramino == qamino:
            return this_orf, None, qpos, None
        else:
            return this_orf, ramino, qpos, qamino
