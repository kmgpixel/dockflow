import { useLayoutEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

// Titre compact + recherche/filtres collants ; animation liée au défilement du conteneur .scroll
export function StickHead({ title, sub, children }) {
  const ref = useRef(null)
  useLayoutEffect(() => { ref.current = document.querySelector('.scroll') }, [])
  const { scrollY } = useScroll({ container: ref })
  const p = useTransform(scrollY, [70, 120], [0, 1])
  const y = useTransform(p, (v) => (1 - v) * -8)
  return (<>
    <div className="cmp-w">
      <motion.div className="cmp" data-stick style={{ opacity: p, y }}><span>{title}</span><span>{sub}</span></motion.div>
    </div>
    <motion.div className="stick" style={{ '--p': p }}>{children}</motion.div>
  </>)
}
