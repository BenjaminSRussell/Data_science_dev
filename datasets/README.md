# Shared dataset catalog

`datasets/manifest.json` is the catalog that ties a notebook to the file it writes, the Scrapy Delta Lake table it reads, and the Data-visualizer dataset of the same shape.

Each entry has:

| Field | Meaning |
| --- | --- |
| `name` | Stable id |
| `path` | Sample file in this repo (notebook output) |
| `schema` | Column names and types for that file |
| `produced_by` | Notebook that writes `path` |
| `lake_path` | `scrapy:Scraping_project/data/delta_lake/<table>` |
| `visualizer_path` | `data-visualizer:/api/datasets/<id>` |

Lake table names match Scrapy's Delta schema registry. Visualizer ids match `PREDEFINED_DATASETS` in Data-visualizer (`urls_by_domain`, `page_metadata_with_urls`, `status_codes_distribution`, and the other built-ins).

The game screen **NAVIGATION → DATA** lists this file and the **EXPORT MANIFEST** button downloads it. CI runs `node scripts/validate-dataset-manifest.js`.

## Sample entries

### urls_by_domain

- **Path:** `datasets/samples/urls_by_domain.csv`
- **Produced by:** `notebooks/01_urls_by_domain.ipynb`
- **Lake:** `scrapy:Scraping_project/data/delta_lake/stage1_discovery`
- **Visualizer:** `data-visualizer:/api/datasets/urls_by_domain`
- **Schema:** `domain` string, `url_count` integer, `file_types` integer, `last_crawl` timestamp, `success_rate` number
- Domain counts derived from discovered URLs. The visualizer query groups its `urls` table the same way.

### page_metadata

- **Path:** `datasets/samples/page_metadata.csv`
- **Produced by:** `notebooks/02_page_metadata.ipynb`
- **Lake:** `scrapy:Scraping_project/data/delta_lake/stage2_page_analysis`
- **Visualizer:** `data-visualizer:/api/datasets/page_metadata_with_urls`
- **Schema:** `url` string, `domain` string, `title` string, `word_count` integer, `quality_score` number, `processed_at` timestamp
- Title and length come from stage2 page analysis. The visualizer dataset joins `page_metadata` to `urls`.

### http_status_codes

- **Path:** `datasets/samples/http_status_codes.csv`
- **Produced by:** `notebooks/03_http_status_codes.ipynb`
- **Lake:** `scrapy:Scraping_project/data/delta_lake/error_log`
- **Visualizer:** `data-visualizer:/api/datasets/status_codes_distribution`
- **Schema:** `status_code` integer, `count` integer, `percentage` number
- Status histogram from `error_log.http_status_code`. The visualizer dataset groups `urls.status_code`.
