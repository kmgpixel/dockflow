import { today } from './dates'

// Commandes rattachées à un camion : chargées/parties (tous jours de livraison) + clôturées du jour
export const truckOrders = (s, driver) => s.orders.filter((o) => o.driver === driver && o.status !== 'cancel' &&
  (['loaded', 'go'].includes(o.status) || (['done', 'fail'].includes(o.status) && o.date >= today())))
export const toLoad = (s, t, tm) => s.orders.filter((o) => o.status === 'ready' && (o.date === t || o.date === tm))
  .sort((a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')))
