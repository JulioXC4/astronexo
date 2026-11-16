import type { Destination } from '../../game';
import { useI18n } from '../../i18n';
import { findingImage } from './explorationAssets';
import { AssetImage } from './AssetImage';

interface CollectionListProps {
  readonly destination: Destination;
  /** Una entrada por pieza (índice en la colección del destino). */
  readonly collection: readonly number[];
}

/** «Tu colección»: lo recogido en las salidas, agrupado («Basalto ×4»). */
export function CollectionList({ destination, collection }: CollectionListProps) {
  const { t } = useI18n();
  const grouped = new Map<number, number>();
  for (const index of collection) grouped.set(index, (grouped.get(index) ?? 0) + 1);

  return <section className="collection-list" aria-label={t('exploration.collectionTitle')}>
    <h3>{t('exploration.collectionTitle')}</h3>
    {grouped.size === 0
      ? <p>{t('exploration.collectionEmpty')}</p>
      : <ul>{[...grouped.entries()].map(([index, count]) => {
        const key = `exploration.collections.${destination}.${index}`;
        return <li key={index}>
          <AssetImage src={findingImage(destination, index)} className="collection-list__thumb" />
          <strong>{t(`${key}.name`)}{count > 1 ? ` ×${count}` : ''}</strong>
          <span>{t(`${key}.text`)}</span>
        </li>;
      })}</ul>}
  </section>;
}
