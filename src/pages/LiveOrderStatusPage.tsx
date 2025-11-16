import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import LiveOrderStatus from "@/components/LiveOrderStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import AnimatedWrapper from "@/components/AnimatedWrapper";

const LiveOrderStatusPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnimatedWrapper type="slide" delay={0.1}>
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Live Order Status</CardTitle>
                <CardDescription>
                  Real-time updates of all orders across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This page shows all recent orders with live status updates. Orders are displayed in real-time as they are placed and updated.
                </p>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <LiveOrderStatus limit={20} />
            </div>
          </motion.div>
        </AnimatedWrapper>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default LiveOrderStatusPage;