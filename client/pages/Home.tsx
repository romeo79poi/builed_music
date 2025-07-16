import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Headphones, User, Search, Clock, Settings } from "lucide-react";

export default function Home() {
  const trendingItems = [
    {
      id: 1,
      title: "Trending",
      artist: "Therropaun",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      category: "Trending",
    },
    {
      id: 2,
      title: "Recently Played",
      artist: "Soumy Pasic",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      category: "Recently Played",
    },
    {
      id: 3,
      title: "Recently",
      artist: "Selilance P",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      category: "Recently",
    },
  ];

  const featuredPlaylists = [
    {
      id: 1,
      title: "Flancley Playand",
      subtitle: "Projest 2015",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
      percentage: "5.1%",
    },
    {
      id: 2,
      title: "Waria'-Intiyamo",
      subtitle: "Arejest 2014",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
      percentage: "5.1%",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Headphones className="w-8 h-8 text-white" />
          <Link to="/profile" className="hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-slate-300" />
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Trending</h1>
            <p className="text-slate-300 mb-4">
              Some arythors. <span className="text-slate-400">Sterrice</span>
            </p>
            <Link
              to="/search"
              className="bg-gradient-to-r from-neon-green to-emerald-400 px-8 py-3 rounded-full text-slate-900 font-bold hover:from-emerald-400 hover:to-neon-green transition-all inline-block"
            >
              Searn now
            </Link>
          </motion.div>

          {/* Trending Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Trending</h2>
              <span className="text-neon-green text-sm">19tnrt</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {trendingItems.map((item, index) => (
                <Link to="/player" key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <p className="text-white font-medium text-sm">
                        {item.category}
                      </p>
                      <p className="text-slate-300 text-xs">{item.artist}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Featured Playlists */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Featured Playlists
              </h2>
              <span className="text-neon-green text-sm">142115</span>
            </div>

            <div className="space-y-3">
              {featuredPlaylists.map((playlist, index) => (
                <Link to="/player" key={playlist.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                    className="flex items-center bg-slate-800/30 rounded-lg p-3 backdrop-blur-sm hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <img
                      src={playlist.image}
                      alt={playlist.title}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {playlist.title}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {playlist.subtitle}
                      </p>
                    </div>
                    <span className="text-neon-green text-sm font-medium">
                      {playlist.percentage}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-around">
            <Link to="/home" className="flex flex-col items-center">
              <div className="w-8 h-8 bg-neon-green rounded-lg flex items-center justify-center mb-1">
                <div className="w-4 h-4 bg-slate-900 rounded"></div>
              </div>
              <span className="text-neon-green text-xs font-medium">
                Pussir
              </span>
            </Link>

            <Link to="/history" className="flex flex-col items-center">
              <Clock className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-slate-400 text-xs">Carticcal</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center">
              <Search className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-slate-400 text-xs">Antect</span>
            </Link>

            <Link to="/states" className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border-2 border-slate-400 mb-1"></div>
              <span className="text-slate-400 text-xs">States</span>
            </Link>

            <Link to="/settings" className="flex flex-col items-center">
              <Settings className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-slate-400 text-xs">Roerled</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
