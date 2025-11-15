import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type HeroSlide = Tables<'hero_sliders'>;

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlides();
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from("hero_sliders")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    
    if (data && data.length > 0) {
      setSlides(data);
    } else {
      // Default slides if none in database
      setSlides([
        {
          id: "1",
          title: "কিভাবে গেমারস বাজার ডায়মন্ড কিনবেন?",
          subtitle: "সহজ পদ্ধতিতে আপনার পছন্দের গেমের ডায়মন্ড কিনুন",
          image_url: "/api/placeholder/1200/600",
          link_url: "/",
          created_at: null,
          display_order: 1,
          is_active: true
        }
      ]);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full bg-background animate-fade-in rounded-none sm:rounded-2xl mx-0 sm:mx-5 mt-0 sm:mt-5 mb-5 p-1 sm:p-5 shadow-none border-0">
      <div className="bg-gradient-gaming rounded-none sm:rounded-[15px] m-1 sm:m-5 p-1 sm:p-5 border-[15px] border-solid border-background">
        <div className="aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/8] lg:aspect-[24/8] relative rounded-none">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            >
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/1200/600";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent/10 flex items-center justify-center p-3 sm:p-6">
                <div className="text-center text-white px-3 sm:px-6 animate-fade-in-up max-w-5xl w-full bg-transparent py-4 sm:py-8">
                  <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-2 sm:mb-3 gradient-text drop-shadow-xl leading-tight">
                    {slide.title}
                  </h2>
{slide.subtitle && (
                  <p className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-5 text-gray-100 drop-shadow-md max-w-3xl mx-auto">
                    {slide.subtitle}
                  </p>
                )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-white w-4" 
                  : "bg-white/50 w-2 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;