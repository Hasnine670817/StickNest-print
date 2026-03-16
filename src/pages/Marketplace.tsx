import React, { useState } from "react";
import { Heart, ShoppingCart, ChevronRight, Check } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

// Mock data for products
const baseProducts = [
  {
    id: 1,
    title: "New Riff Creamsicle Brûlée",
    author: "Waylon Spencer",
    likes: 1,
    cart: 3,
    image: "https://picsum.photos/seed/newriff/400/300",
    avatar: "https://picsum.photos/seed/waylon/40/40",
  },
  {
    id: 2,
    title: "Drive Simple, Live Free Bumpe...",
    author: "Mitchell E",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/drivesimple/400/300",
    avatar: "https://picsum.photos/seed/mitchell/40/40",
  },
  {
    id: 3,
    title: "Fun in the Suns",
    author: "David Bunger",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/funsuns/400/300",
    avatar: "https://picsum.photos/seed/david/40/40",
  },
  {
    id: 4,
    title: "I support ICE",
    author: "Constantino For Congress",
    likes: 34,
    cart: 472,
    image: "https://picsum.photos/seed/ice/400/300",
    avatar: "https://picsum.photos/seed/constantino/40/40",
  },
  {
    id: 5,
    title: "Arrested Sun - Sticker Bomb - ...",
    author: "Arrested Sun",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/arrestedsun/400/300",
    avatar: "https://picsum.photos/seed/arrested/40/40",
  },
  {
    id: 6,
    title: "ultrathink",
    author: "Claude Code",
    likes: 39,
    cart: "1.1k",
    image: "https://picsum.photos/seed/ultrathink/400/300",
    avatar: "https://picsum.photos/seed/claude/40/40",
  },
  {
    id: 7,
    title: "Clawd",
    author: "Claude Code",
    likes: 28,
    cart: "1.1k",
    image: "https://picsum.photos/seed/clawd/400/300",
    avatar: "https://picsum.photos/seed/claude/40/40",
  },
  {
    id: 8,
    title: 'GATOR - 12" decal',
    author: "EDSEL GARAGE",
    likes: 1,
    cart: 1,
    image: "https://picsum.photos/seed/gator/400/300",
    avatar: "https://picsum.photos/seed/edsel/40/40",
  },
  {
    id: 9,
    title: "Clawd happy",
    author: "Claude Code",
    likes: 26,
    cart: 859,
    image: "https://picsum.photos/seed/clawdhappy/400/300",
    avatar: "https://picsum.photos/seed/claude/40/40",
  },
  {
    id: 10,
    title: "Anthony Constantino",
    author: "Constantino For Congress",
    likes: 1,
    cart: 76,
    image: "https://picsum.photos/seed/anthony/400/300",
    avatar: "https://picsum.photos/seed/constantino/40/40",
  },
  {
    id: 11,
    title: "You're Here To NOTICE",
    author: "Conversations In Color w/Unfold The Soul",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/notice/400/300",
    avatar: "https://picsum.photos/seed/conversations/40/40",
  },
  {
    id: 12,
    title: "Hardhat 1",
    author: "DiPietro Excavating Inc",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/hardhat/400/300",
    avatar: "https://picsum.photos/seed/dipietro/40/40",
  },
  {
    id: 13,
    title: "Tudor Operations Sticker Pack",
    author: "Tudor Operations",
    likes: 0,
    cart: 6,
    image: "https://picsum.photos/seed/tudor/400/300",
    avatar: "https://picsum.photos/seed/tudorop/40/40",
  },
  {
    id: 14,
    title: "IfGodDeliveredUsTee",
    author: "God Delivers",
    likes: 81,
    cart: "1.1k",
    image: "https://picsum.photos/seed/ifgod/400/300",
    avatar: "https://picsum.photos/seed/goddelivers/40/40",
  },
  {
    id: 15,
    title: "Constantino for Congress Hat",
    author: "Constantino For Congress",
    likes: 2,
    cart: 151,
    image: "https://picsum.photos/seed/conshat/400/300",
    avatar: "https://picsum.photos/seed/constantino/40/40",
  },
  {
    id: 16,
    title: '50 Years Logo 8"',
    author: "DiPietro Excavating Inc",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/50years/400/300",
    avatar: "https://picsum.photos/seed/dipietro/40/40",
  },
  {
    id: 17,
    title: "Clawd shiny",
    author: "Claude Code",
    likes: 23,
    cart: 551,
    image: "https://picsum.photos/seed/clawdshiny/400/300",
    avatar: "https://picsum.photos/seed/claude/40/40",
  },
  {
    id: 18,
    title: "Constantino for Congress",
    author: "Constantino For Congress",
    likes: 7,
    cart: 406,
    image: "https://picsum.photos/seed/conshoodie/400/300",
    avatar: "https://picsum.photos/seed/constantino/40/40",
  },
  {
    id: 19,
    title: "GG Will 2.0 (Little Bro)",
    author: "GoodGameWill",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/ggwill1/400/300",
    avatar: "https://picsum.photos/seed/ggwill/40/40",
  },
  {
    id: 20,
    title: "GG Will 2.0 (Big Bro)",
    author: "GoodGameWill",
    likes: 0,
    cart: 1,
    image: "https://picsum.photos/seed/ggwill2/400/300",
    avatar: "https://picsum.photos/seed/ggwill/40/40",
  },
];

const allProducts = Array.from({ length: 150 }, (_, i) => {
  const base = baseProducts[i % baseProducts.length];
  return {
    ...base,
    id: i + 1,
    likes: base.likes + ((i * 7) % 50),
  };
});

const giveaways = [
  {
    id: 1,
    title: "5,000 sticker packs",
    remaining: "4836 remaining",
    image: "https://picsum.photos/seed/giveaway1/60/60",
  },
  {
    id: 2,
    title: "100,000 sticker p...",
    remaining: "94278 remaining",
    image: "https://picsum.photos/seed/giveaway2/60/60",
  },
];

const popularStores = [
  {
    id: 1,
    name: "Claude Code",
    orders: "2,586 orders",
    avatar: "https://picsum.photos/seed/claude/40/40",
    isPro: false,
  },
  {
    id: 2,
    name: "The Real G...",
    orders: "1,998 orders",
    avatar: "https://picsum.photos/seed/realg/40/40",
    isPro: true,
  },
  {
    id: 3,
    name: "God Delivers",
    orders: "1,813 orders",
    avatar: "https://picsum.photos/seed/goddelivers/40/40",
    isPro: true,
  },
  {
    id: 4,
    name: "Fishtank",
    orders: "1,698 orders",
    avatar: "https://picsum.photos/seed/fishtank/40/40",
    isPro: true,
  },
  {
    id: 5,
    name: "Constantino F...",
    orders: "1,195 orders",
    avatar: "https://picsum.photos/seed/constantino/40/40",
    isPro: true,
  },
  {
    id: 6,
    name: "Sticker Mule",
    orders: "1,096 orders",
    avatar: "https://picsum.photos/seed/stickermule/40/40",
    isPro: true,
  },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("Popular");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and sort products based on active tab
  const getFilteredAndSortedProducts = () => {
    let result = [...allProducts];

    if (activeTab === "Following") {
      result = result.filter(
        (p) =>
          p.author === "Claude Code" || p.author === "Constantino For Congress",
      );
    } else if (activeTab === "Newest") {
      result.sort((a, b) => b.id - a.id);
    } else {
      // Popular
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get current page products
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabClick = (tab: string) => {
    setLoading(true);
    setActiveTab(tab);
    setCurrentPage(1); // Reset page when tab changes
    setTimeout(() => setLoading(false), 300); // Simulate a short loading delay
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate pagination numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex gap-8">
          {["Popular", "Following", "Newest"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-4 text-[15px] border-b-4 ${
                activeTab === tab
                  ? "text-[#333] border-[#ff7a00]"
                  : "text-gray-500 border-transparent hover:text-[#333]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Products Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  {/* Image Container */}
                  <div className="bg-[#f4f4f4] aspect-[4/3] rounded-md overflow-hidden mb-3 relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={product.avatar}
                        alt={product.author}
                        className="w-6 h-6 rounded-full shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-[13px] font-bold text-[#333] truncate leading-tight">
                          {product.title}
                        </h3>
                        <p className="text-[12px] text-gray-500 truncate leading-tight mt-0.5">
                          {product.author}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 shrink-0 ml-2 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[12px] font-medium">
                          {product.likes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[12px] font-medium">
                          {product.cart}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-3 flex items-center justify-center border border-gray-200 text-gray-600 rounded text-sm hover:bg-gray-50 gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Prev
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${
                      currentPage === page
                        ? "border-[#0066cc] text-[#0066cc] font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 flex items-center justify-center border border-gray-200 text-gray-600 rounded text-sm hover:bg-gray-50 gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-gray-500">
                Page{" "}
                <span className="font-bold text-[#0066cc]">{currentPage}</span>{" "}
                of {totalPages}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-10">
          {/* Sell your merch */}
          <div>
            <h2 className="text-[18px] font-bold text-[#333] mb-2">
              Sell your merch
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
              We handle fulfillment and support so you can focus on making
              money.
            </p>
            <div className="flex flex-col gap-2">
              <button className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-4 rounded transition-colors text-[15px]">
                Create a store
              </button>
              <button className="w-full bg-[#f4f4f4] hover:bg-[#e5e5e5] text-[#333] font-bold py-2.5 px-4 rounded transition-colors text-[15px]">
                Learn more
              </button>
            </div>
          </div>

          {/* Giveaways */}
          <div>
            <h2 className="text-[18px] font-bold text-[#333] mb-4">
              Giveaways
            </h2>
            <div className="flex flex-col gap-4">
              {giveaways.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-md object-cover border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-[14px] font-bold text-[#333] leading-tight group-hover:text-[#0066cc] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {item.remaining}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular stores */}
          <div>
            <h2 className="text-[18px] font-bold text-[#333] mb-4">
              Popular stores
            </h2>
            <div className="flex flex-col gap-4">
              {popularStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={store.avatar}
                      alt={store.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-[14px] font-bold text-[#333] leading-tight group-hover:text-[#0066cc] transition-colors truncate max-w-[120px]">
                          {store.name}
                        </h3>
                        {store.isPro && (
                          <div
                            className="bg-[#ff7a00] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shrink-0"
                            title="PRO"
                          >
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                        )}
                        {store.isPro && (
                          <span className="bg-gray-500 text-white text-[9px] font-bold px-1 rounded shrink-0">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {store.orders}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
            <a
              href="#"
              className="inline-block mt-4 text-[14px] font-bold text-[#0066cc] hover:underline"
            >
              Browse all 28,528 stores
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
