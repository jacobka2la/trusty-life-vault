import logoImg from '@/assets/logo.png';

const blueFilter = 'brightness(0) saturate(100%) invert(25%) sepia(98%) saturate(1800%) hue-rotate(211deg) brightness(92%) contrast(95%)';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'h-7 w-7' }: LogoProps) => (
  <img src={logoImg} alt="DocuVault" className={className} style={{ filter: blueFilter }} />
);

export default Logo;
