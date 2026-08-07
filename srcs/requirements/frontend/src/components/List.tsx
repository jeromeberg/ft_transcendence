import Container, { type ContainerVariant } from './Container';

interface ListItem {
  id: string | number;
  [key: string]: unknown;
}

interface ListProps<T extends ListItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  containerVariant?: ContainerVariant;
  getItemClassName?: (item: T, index: number) => string;
}

export function List<T extends ListItem>({
  items,
  renderItem,
  className = '',
  containerVariant,
  getItemClassName,
}: ListProps<T>) {
  return (
    <ul className={['flex flex-col gap-3', className].join(' ')}>
      {items.map((item, index) => (
        <li key={item.id}>
          <Container
            variant={containerVariant}
            className={[
              'transition-colors duration-150 hover:border-default',
              getItemClassName?.(item, index) ?? '',
            ].join(' ')}
          >
            {renderItem(item, index)}
          </Container>
        </li>
      ))}
    </ul>
  );
}
