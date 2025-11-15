import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";

const SocialLinks = () => {
  return (
    <div className="py-6 sm:py-8 bg-muted/50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
          <Button
            variant="outline"
            className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 hover:from-blue-600 hover:to-blue-700 hover:border-blue-600 shadow-lg hover:shadow-xl transition-all hover-lift h-auto py-3 sm:py-3 px-4 sm:px-5 md:px-6 w-full sm:flex-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <Send className="h-5 w-5 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs sm:text-sm font-medium opacity-90">Join us on</div>
              <div className="text-base sm:text-lg md:text-xl font-bold">Telegram</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 hover:from-green-600 hover:to-green-700 hover:border-green-600 shadow-lg hover:shadow-xl transition-all hover-lift h-auto py-3 sm:py-3 px-4 sm:px-5 md:px-6 w-full sm:flex-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageCircle className="h-5 w-5 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="text-left flex-1">
              <div className="text-xs sm:text-sm font-medium opacity-90">Join us on</div>
              <div className="text-base sm:text-lg md:text-xl font-bold">WhatsApp</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;