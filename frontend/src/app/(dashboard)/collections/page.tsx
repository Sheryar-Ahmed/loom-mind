import { CollectionList } from '@/components/features/collections/CollectionList';

export const metadata = {
  title: 'Collections | MemoryLayer',
  description: 'Organize your captures into collections',
};

export default function CollectionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-2">
            Organize your captures into collections and share them with others.
          </p>
        </div>
        <CollectionList />
      </div>
    </div>
  );
}
