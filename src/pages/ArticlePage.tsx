import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../components/ArticleCard';
import BookmarkButton from '../components/BookmarkButton';
import { journalById } from '../data/journals';
import { downloadText, toBibtex, toVancouver } from '../lib/citation';
import { cacheArticles, deletePdf, getArticle, getPdf } from '../lib/db';
import { enrichOpenAccess } from '../lib/europepmc';
import { canCachePdf, downloadPdf, isNew, openCachedPdf } from '../lib/pdf';
import { fetchCrossrefWork } from '../lib/crossref';
import { fetchPubmed } from '../lib/pubmed';
import { parseArticleId } from '../lib/routes';
import type { Article } from '../lib/types';

/** From device storage, else fetched again (a shared link, or storage unavailable). */
async function loadArticle(id: string): Promise<Article | undefined> {
  const cached = await getArticle(id).catch(() => undefined);
  if (cached) return cached;
  let fetched: Article[] = [];
  if (id.startsWith('pmid:')) fetched = await enrichOpenAccess(await fetchPubmed([id.slice(5)]));
  else if (id.startsWith('doi:')) fetched = [await fetchCrossrefWork(id.slice(4))].filter((x): x is Article => !!x);
  return (await cacheArticles(fetched).catch(() => fetched))[0];
}

export default function ArticlePage() {
  const id = parseArticleId(useParams()['*']);
  const navigate = useNavigate();
  // A tapped card passes its article along, so the page shows at once without a storage round trip.
  const passed = (useLocation().state as { article?: Article } | null)?.article;
  const [a, setA] = useState<Article | null | undefined>(passed?.id === id ? passed : undefined);
  const [hasPdf, setHasPdf] = useState(false);
  const [pdfState, setPdfState] = useState<'idle' | 'busy' | string>('idle');

  useEffect(() => {
    if (passed?.id !== id) loadArticle(id).then((x) => setA(x ?? null)).catch(() => setA(null));
    getPdf(id).then((p) => setHasPdf(!!p)).catch(() => undefined);
  }, [id, passed]);

  if (a === undefined) return <p className="empty">Loading…</p>;
  if (a === null)
    return (
      <p className="empty">
        Article not found. <Link to="/">Back to browse</Link>
      </p>
    );

  const journal = journalById(a.journalId);
  const fileBase = `${a.authors[0]?.last ?? 'article'}-${a.year}`.replace(/[^\w-]/g, '');

  const savePdf = async () => {
    setPdfState('busy');
    try {
      await downloadPdf(a);
      setHasPdf(true);
      setPdfState('idle');
    } catch (e) {
      setPdfState((e as Error).message);
    }
  };

  return (
    <article className="detail">
      <button type="button" className="back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className={`detail-hero ${a.isOpenAccess ? 'card-free' : 'card-paid'}`}>
        <div className="card-top">
          <span className={`access ${a.isOpenAccess ? 'access-free' : 'access-paid'}`}>
            {a.isOpenAccess ? 'Open access' : '🔒 Subscription'}
          </span>
          {isNew(a) && <span className="badge-new">New</span>}
          <BookmarkButton id={a.id} withLabel />
        </div>
        <h1>{a.title}</h1>
        <p className="detail-journal">
          <strong>{a.journalTitle}</strong>
          {journal && <> · {journal.region}</>} · {formatDate(a.pubDate)}
          {a.volume && <> · Vol {a.volume}</>}
          {a.issue && <>({a.issue})</>}
          {a.pages && <>: {a.pages}</>}
        </p>
        <p className="detail-authors">
          {a.authors.map((x) => `${x.first} ${x.last}`.trim()).join(', ') || 'No authors listed'}
        </p>
        <div className="chips">
          {a.topics.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="actions">
        {(hasPdf || canCachePdf(a)) &&
          (hasPdf ? (
            <>
              <button type="button" className="btn btn-free" onClick={() => openCachedPdf(a.id)}>
                Open offline PDF
              </button>
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  await deletePdf(a.id);
                  setHasPdf(false);
                }}
              >
                Remove download
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-free" onClick={savePdf} disabled={pdfState === 'busy'}>
              {pdfState === 'busy' ? 'Downloading…' : '⤓ Save PDF offline'}
            </button>
          ))}
        {a.isOpenAccess && a.pdfUrl && (
          <a className="btn" href={a.pdfUrl} target="_blank" rel="noreferrer">
            Read PDF online
          </a>
        )}
        {a.isOpenAccess && a.pmcid && (
          <a className="btn btn-free-outline" href={`https://pmc.ncbi.nlm.nih.gov/articles/${a.pmcid}/`} target="_blank" rel="noreferrer">
            Read full text (PMC)
          </a>
        )}
        {a.doi && (
          <a
            className={`btn ${a.isOpenAccess && !a.pmcid ? 'btn-free-outline' : ''}`}
            href={`https://doi.org/${a.doi}`}
            target="_blank"
            rel="noreferrer"
          >
            {a.isOpenAccess ? (a.pmcid ? 'Publisher page' : 'Read full text (publisher)') : '🔒 Publisher page'}
          </a>
        )}
        {a.pmid && (
          <a className="btn" href={`https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`} target="_blank" rel="noreferrer">
            PubMed
          </a>
        )}
      </div>
      {pdfState !== 'idle' && pdfState !== 'busy' && (
        <p className="errors">
          Couldn't save the PDF: {pdfState}.{' '}
          {a.pdfUrl && (
            <a href={a.pdfUrl} target="_blank" rel="noreferrer">
              Open it online instead
            </a>
          )}
        </p>
      )}

      <section className="abstract">
        <h2>Abstract</h2>
        {a.abstract ? (
          a.abstract.split('\n\n').map((p, i) => {
            const m = p.match(/^([A-Z][A-Z &/-]+): (.*)$/s);
            return m ? (
              <p key={i}>
                <strong>{m[1][0] + m[1].slice(1).toLowerCase()}.</strong> {m[2]}
              </p>
            ) : (
              <p key={i}>{p}</p>
            );
          })
        ) : (
          <p className="muted">No abstract available.</p>
        )}
      </section>

      <section className="cite">
        <h2>Cite</h2>
        <pre>{toVancouver(a)}</pre>
        <div className="actions">
          <button type="button" className="btn" onClick={() => downloadText(`${fileBase}-vancouver.txt`, toVancouver(a))}>
            ⤓ Vancouver (.txt)
          </button>
          <button type="button" className="btn" onClick={() => downloadText(`${fileBase}-bibtex.txt`, toBibtex(a))}>
            ⤓ BibTeX (.txt)
          </button>
          <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(toVancouver(a))}>
            Copy
          </button>
        </div>
      </section>
    </article>
  );
}
