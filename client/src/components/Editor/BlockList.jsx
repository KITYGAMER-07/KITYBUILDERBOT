import React from 'react';
import { BlockWrapper } from './BlockWrapper';
import { HeadingEditor } from './BlockEditors/HeadingEditor';
import { ParagraphEditor } from './BlockEditors/ParagraphEditor';
import { TableEditor } from './BlockEditors/TableEditor';
import { ListEditor } from './BlockEditors/ListEditor';
import { DetailsEditor } from './BlockEditors/DetailsEditor';
import { QuoteEditor } from './BlockEditors/QuoteEditor';
import { CodeEditor } from './BlockEditors/CodeEditor';
import { MathEditor } from './BlockEditors/MathEditor';
import { SlideshowEditor } from './BlockEditors/SlideshowEditor';
import { CollageEditor } from './BlockEditors/CollageEditor';
import { MediaEditor } from './BlockEditors/MediaEditor';
import { MapEditor } from './BlockEditors/MapEditor';
import { ButtonEditor } from './BlockEditors/ButtonEditor';
import { FooterEditor } from './BlockEditors/FooterEditor';

export const BlockList = ({
  blocks = [],
  onUpdateBlock,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete
}) => {
  if (blocks.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-2">
        <p className="text-sm font-medium text-slate-400">No message blocks added yet</p>
        <p className="text-xs text-slate-500">
          Click any block above to start building your rich Telegram post!
        </p>
      </div>
    );
  }

  const renderEditor = (block, idx) => {
    const handleChange = (updated) => onUpdateBlock(idx, updated);

    switch (block.type) {
      case 'heading':
        return <HeadingEditor block={block} onChange={handleChange} />;
      case 'paragraph':
        return <ParagraphEditor block={block} onChange={handleChange} />;
      case 'table':
        return <TableEditor block={block} onChange={handleChange} />;
      case 'list':
        return <ListEditor block={block} onChange={handleChange} />;
      case 'details':
        return <DetailsEditor block={block} onChange={handleChange} />;
      case 'blockquote':
      case 'pullquote':
        return <QuoteEditor block={block} onChange={handleChange} />;
      case 'code':
        return <CodeEditor block={block} onChange={handleChange} />;
      case 'math':
        return <MathEditor block={block} onChange={handleChange} />;
      case 'slideshow':
        return <SlideshowEditor block={block} onChange={handleChange} />;
      case 'collage':
        return <CollageEditor block={block} onChange={handleChange} />;
      case 'photo':
      case 'video':
      case 'animation':
      case 'audio':
      case 'voice':
        return <MediaEditor block={block} onChange={handleChange} />;
      case 'map':
        return <MapEditor block={block} onChange={handleChange} />;
      case 'buttons':
        return <ButtonEditor block={block} onChange={handleChange} />;
      case 'footer':
      case 'anchor':
        return <FooterEditor block={block} onChange={handleChange} />;
      case 'divider':
        return (
          <div className="text-xs text-slate-500 italic text-center py-1">
            Horizontal divider line (render separator)
          </div>
        );
      default:
        return <div className="text-xs text-red-400">Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <BlockWrapper
          key={block.id || index}
          block={block}
          index={index}
          total={blocks.length}
          onMoveUp={() => onMoveUp(index)}
          onMoveDown={() => onMoveDown(index)}
          onDuplicate={() => onDuplicate(index)}
          onDelete={() => onDelete(index)}
        >
          {renderEditor(block, index)}
        </BlockWrapper>
      ))}
    </div>
  );
};
