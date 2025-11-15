import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ProductWithStock extends Tables<'products'> {
  totalStock: number;
  hasVariants: boolean;
}

const GameSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (productsError) throw productsError;

      // Fetch variants with voucher codes info for each product
      const productsWithStock = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: variants } = await supabase
            .from("product_variants")
            .select(`
              id, 
              stock_quantity, 
              is_active,
              voucher_codes(status)
            `)
            .eq("product_id", product.id)
            .eq("is_active", true);

          // Calculate total stock from available voucher codes instead of stored stock_quantity
          const totalAvailableStock = variants?.reduce((total, variant) => {
            const availableCodes = variant.voucher_codes?.filter(
              (code: { status: string }) => code.status === 'available'
            ) || [];
            return total + availableCodes.length;
          }, 0) || 0;

          return {
            ...product,
            totalStock: totalAvailableStock,
            hasVariants: variants && variants.length > 0
          };
        })
      );

      setProducts(productsWithStock);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const gradients = [
    "bg-gradient-primary",
    "bg-gradient-fire",
    "bg-gradient-gaming",
    "bg-gradient-ocean",
    "bg-gradient-success",
    "bg-gradient-sunset",
    "bg-gradient-to-br from-purple-500 to-pink-500",
    "bg-gradient-to-br from-green-500 to-teal-500"
  ];

  // Category background colors for distinct sections
  const categoryBackgrounds = [
    "bg-gradient-to-r from-blue-50 to-indigo-50",
    "bg-gradient-to-r from-red-50 to-orange-50",
    "bg-gradient-to-r from-green-50 to-emerald-50",
    "bg-gradient-to-r from-purple-50 to-fuchsia-50",
    "bg-gradient-to-r from-yellow-50 to-amber-50",
    "bg-gradient-to-r from-pink-50 to-rose-50",
    "bg-gradient-to-r from-cyan-50 to-sky-50",
    "bg-gradient-to-r from-violet-50 to-purple-50"
  ];

  if (isLoading) {
    return (
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Products
            </h2>
            <p className="text-muted-foreground">No products available at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Admin can add products from the admin panel
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const categories = Object.keys(groupedProducts);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 space-y-16">
        {categories.map((category, categoryIndex) => (
          <div key={category} className={`animate-fade-in-up rounded-2xl p-6 shadow-lg ${categoryBackgrounds[categoryIndex % categoryBackgrounds.length]}`} style={{ animationDelay: `${categoryIndex * 0.2}s` }}>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-3 md:mb-4 gradient-text bg-clip-text">
                {category.toUpperCase()}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Choose your gaming package and level up instantly
              </p>
              <div className="w-24 h-1 bg-gradient-primary mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {groupedProducts[category].map((product, index) => (
            <Card 
              key={product.id} 
              className="group cursor-pointer hover:shadow-colored hover-lift transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden animate-scale-in bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <CardContent className="p-0">
                {product.image_url ? (
                  <div className="h-28 sm:h-32 md:h-48 relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="${gradients[index % gradients.length]} relative overflow-hidden h-full">
                              <div class="absolute inset-0 opacity-20">
                                <div class="absolute top-3 right-3 w-10 h-10 border-2 border-white/40 rounded-full animate-float"></div>
                                <div class="absolute bottom-3 left-3 w-8 h-8 border-2 border-white/40 rounded-full animate-float" style="animation-delay: 1s"></div>
                                <div class="absolute top-1/2 left-1/2 w-6 h-6 border-2 border-white/40 rounded-full animate-float" style="animation-delay: 2s"></div>
                              </div>
                              <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-16 h-16 sm:w-20 md:w-24 md:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                                  <div class="w-12 h-12 sm:w-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center shadow-inner">
                                    <span class="text-2xl sm:text-3xl md:text-4xl">🎮</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className={`h-28 sm:h-32 md:h-48 ${gradients[index % gradients.length]} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-3 right-3 w-10 h-10 border-2 border-white/40 rounded-full animate-float"></div>
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-2 border-white/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 left-1/2 w-6 h-6 border-2 border-white/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 md:w-24 md:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                        <div className="w-12 h-12 sm:w-16 md:w-20 md:h-20 bg-white rounded-xl flex items-center justify-center shadow-inner">
                          <span className="text-2xl sm:text-3xl md:text-4xl">🎮</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-2 sm:p-3 md:p-4 text-center">
                  <h3 className="font-semibold font-heading text-xs sm:text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    {product.category && (
                      <p className="text-[0.6rem] sm:text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                        {product.category}
                      </p>
                    )}
                    {product.hasVariants && (
                      <p className={`text-[0.6rem] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                        product.totalStock > 0 
                          ? 'bg-gradient-success text-success-foreground' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {product.totalStock > 0 ? `In Stock` : 'Available'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GameSection;