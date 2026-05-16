import { motion, useReducedMotion } from 'framer-motion'

// Scroll-in entrance — the house pattern. Fades and lifts its children
// once, the first time they cross into view. Honors reduced-motion by
// dropping the lift and showing content immediately.
export default function Reveal({ children, as = 'div', delay = 0, y = 28, className, id }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </MotionTag>
  )
}
