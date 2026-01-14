import { motion } from "framer-motion"
import { ReactNode } from "react"

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 10, filter: "blur(6px)" },
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  )
}
