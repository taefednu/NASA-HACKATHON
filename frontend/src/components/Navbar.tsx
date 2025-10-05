import { Link, useLocation } from "react-router-dom";
import { Satellite } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  
  const links = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
    { name: "Why It Matters", path: "/why" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg hover:text-secondary transition-colors">
          <Satellite className="w-6 h-6" />
          <span>Atmosight</span>
        </Link>
        
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
