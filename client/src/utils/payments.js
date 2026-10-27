// UPI apps offered at the DEMO checkout. IMovies never contacts these apps
// and no money moves: the brand names are only used to label the choice.
export const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', initials: 'Pe', color: '#5f259f' },
  { id: 'gpay', name: 'Google Pay', initials: 'G', color: '#1a73e8' },
  { id: 'paytm', name: 'Paytm', initials: 'P', color: '#00b9f1' },
]

export const paymentLabel = (id) => UPI_APPS.find((app) => app.id === id)?.name || 'UPI'
