"""Which PubMed journals is PubMed behind on? For each, takes a random sample of Crossref papers
registered 1 to 4 months ago and checks how many PubMed has. Items PubMed never lists (meeting
abstracts in supplements, front matter, papers without authors) are left out of the sample, as the
app leaves them out (lib/gap.ts). Journals with >= 40% of a sample of at least 8 missing are marked
LAG: give them `pubmedLag: true` in src/data/journals.ts.
Usage: python -I scripts/audit-pubmed-lag.py [journal ids]  (all journals: about 6 minutes)."""
import datetime, json, re, sys, time, urllib.parse, urllib.request

src = open('src/data/journals.ts', encoding='utf8').read()
rows = re.findall(r"id: '([^']+)', name: '(.*?)', abbr.*?issns: \[([^\]]+)\].*?source: '(\w+)'", src)
today = datetime.date.today()
since, until = today - datetime.timedelta(days=120), today - datetime.timedelta(days=30)
# Mirrors JUNK_TITLE in src/lib/crossref.ts.
JUNK = re.compile(r'^(editorial board|ed board|issue information|table of contents|toc|future issues|contents|masthead|cover|.*newsletter|corrigendum|erratum|retraction|correction to|review of\s*:|decision letter|author response|reviewer report)\b|---', re.I)
SUPPLEMENT = re.compile(r'^S\d', re.I)


def get(url, data=None):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'JeevsOMFSReader-audit'})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            time.sleep(3 * (attempt + 1))
    return None


def listed(w):
    title = (w.get('title') or [''])[0]
    return w.get('author') and title and not JUNK.search(title) and not SUPPLEMENT.match(w.get('page') or '')


for jid, name, issns, source in rows:
    if source != 'pubmed' or (sys.argv[1:] and jid not in sys.argv[1:]):
        continue
    issns = re.findall(r"'([^']+)'", issns)
    f = ','.join(f'issn:{i}' for i in issns) + f',type:journal-article,from-created-date:{since},until-created-date:{until}'
    cr = get('https://api.crossref.org/works?sample=40&select=DOI,title,author,page&filter=' + urllib.parse.quote(f))
    time.sleep(1.1)
    if cr is None:
        print(f'{jid}\tcrossref error\t\t\t\t{name}', flush=True)
        continue
    dois = [w['DOI'] for w in cr['message']['items'] if listed(w)][:30]
    if len(dois) < 8:
        print(f'{jid}\t{len(dois)}\t\t\ttoo few\t{name}', flush=True)
        continue
    term = ' OR '.join(f'"{d}"[aid]' for d in dois)
    body = urllib.parse.urlencode({'db': 'pubmed', 'retmode': 'json', 'retmax': 100, 'term': term}).encode()
    pm = get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', body)
    time.sleep(0.4)
    if pm is None:
        print(f'{jid}\tpubmed error\t\t\t\t{name}', flush=True)
        continue
    found = min(int(pm['esearchresult']['count']), len(dois))
    missing = 1 - found / len(dois)
    print(f'{jid}\t{len(dois)}\t{found}\t{missing:.0%}\t{"LAG" if missing >= 0.4 else ""}\t{name}', flush=True)
