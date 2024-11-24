import os
import requests
import argparse


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--outdir", type=str, default="data",
                        help="option, path to write output file")
    return parser.parse_args()


def get_alias_keys(outdir):
    """
    Uses python requests library
    :outdit: str, folder path of output folder.
    :return: str, absolute file path to the downloaded file.
    """
    try:
        url = 'https://raw.githubusercontent.com/cov-lineages/pango-designation/master/pango_designation/alias_key.json'
        filepath = os.path.join(outdir, "alias_key.json")
        request = requests.get(url, allow_redirects=True)
        with open(filepath, 'wb') as file:
            file.write(request.content)
        print("Downloaded lineage alias keys into {}".format(filepath))
    except:
        print(f"Unable to get lineage aliases. Try manually downloading the alias keys json into {outdir}/alias_key.json")

    return filepath


if __name__ == '__main__':
    args = parse_args()
    get_alias_keys(args.outdir)