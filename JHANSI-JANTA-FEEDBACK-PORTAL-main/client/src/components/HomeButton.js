import { Link } from 'react-router-dom';

export default function HomeButton() {
  return (
    <Link to="/" className="home-fab" aria-label="Go to home">
      <span className="home-fab-icon">🏠</span>
      <span className="home-fab-text">Home</span>
    </Link>
  );
}
