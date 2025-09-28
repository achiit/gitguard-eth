
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Users, FileCheck, CheckCircle, TrendingUp } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      {/* Dashboard Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-400">GigGuard Dashboard</div>
        <div className="w-24"></div>
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Sidebar */}
        <div className="col-span-3 bg-gray-800 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4800] to-[#ff6000]"></div>
            <div>
              <div className="text-sm font-medium text-white">Alex Morgan</div>
              <div className="text-xs text-gray-400">Web Developer</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2 px-2 py-1.5 bg-gradient-to-r from-[#ff6d00] to-[#ff7900] rounded-md text-white">
              <BarChart className="h-4 w-4 text-[#FFCC66]" />
              <span className="text-sm">Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-2 px-2 py-1.5 text-gray-400 hover:text-white">
              <FileCheck className="h-4 w-4" />
              <span className="text-sm">Contracts</span>
            </div>
            
            <div className="flex items-center space-x-2 px-2 py-1.5 text-gray-400 hover:text-white">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Invoices</span>
            </div>
            
            <div className="flex items-center space-x-2 px-2 py-1.5 text-gray-400 hover:text-white">
              <Users className="h-4 w-4" />
              <span className="text-sm">Clients</span>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="col-span-9 space-y-4">
          {/* Welcome Bar */}
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-0">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <h3 className="text-lg text-white font-medium">Welcome back, Alex</h3>
                <p className="text-sm text-gray-400">Here's what's happening with your business today.</p>
              </div>
              <Badge className="bg-[#ff6d00] text-white hover:bg-[#ff7900]">3 Tasks Due Soon</Badge>
            </CardContent>
          </Card>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-medium text-gray-400">Active Contracts</div>
                  <div className="w-8 h-8 rounded-full bg-[#ff7900]/20 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-[#ff6000]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">7</div>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+2</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-medium text-gray-400">Pending Invoices</div>
                  <div className="w-8 h-8 rounded-full bg-[#ff7900]/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-[#ff6000]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-white">$5,240</span>
                  <span className="text-gray-400 ml-1">total value</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-medium text-gray-400">Active Clients</div>
                  <div className="w-8 h-8 rounded-full bg-[#ff7900]/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#ff6000]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+3</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-medium text-gray-400">Revenue (MTD)</div>
                  <div className="w-8 h-8 rounded-full bg-[#ff7900]/20 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-[#ff6000]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">$14,280</div>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+18%</span>
                  <span className="text-gray-400 ml-1">vs. last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart Area */}
          <Card className="bg-gray-800 border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-medium text-white">Revenue Overview</h4>
                  <p className="text-xs text-gray-400">Monthly revenue breakdown</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-white border-[#ff6d00] bg-[#ff7900]">This Year</Badge>
                  <Badge variant="outline" className="text-gray-400 border-gray-500/30">Last Year</Badge>
                </div>
              </div>
              
              {/* Mock Chart */}
              <div className="h-48 w-full mt-1">
                <div className="h-full w-full flex items-end justify-between px-2">
                  {[35, 55, 40, 70, 85, 60, 55, 45, 65, 75, 50, 65].map((height, i) => (
                    <div key={i} className="relative w-full mx-0.5 group">
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-xs text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${height * 100}
                      </div>
                      <div 
                        className="bg-gradient-to-t from-[#FF9F5A] to-[#FFCC66] rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
