import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { PlusIcon } from './Icons'

interface BookListProps {
  books: Array<{ id: string; title: string; archiveNo: string; coverImageUrl: string }>
  onOpen: (id: string) => void
  onDelete: (id: string, title: string) => void
  onCreate: () => void
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
)

export function BookList({ books, onOpen, onDelete, onCreate }: BookListProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex-shrink-0"
        >
          <Card onClick={() => onOpen(book.id)} className="w-[160px] h-[220px] relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-[24px] bg-gradient-to-r from-[#3d1a00] to-[#7a3b12] z-10" />
            <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(book.id, book.title) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-[#FF4D4F]/80 transition-colors z-20"
            >
              <TrashIcon />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-[24px] right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-[14px] font-medium truncate">{book.title}</p>
              <p className="text-white/70 text-[11px]">{book.archiveNo}</p>
            </div>
          </Card>
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: books.length * 0.05 }} className="flex-shrink-0">
        <Card onClick={onCreate} className="w-[160px] h-[220px] flex flex-col items-center justify-center gap-3 border-dashed hover:border-[#8B4513] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center"><PlusIcon /></div>
          <span className="text-[13px] text-[#999]">新建图册</span>
        </Card>
      </motion.div>
    </div>
  )
}
