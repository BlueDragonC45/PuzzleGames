import './globals.css'

export const metadata = {
  title: 'Puzzle Games',
  description: 'Puzzles Games',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}