import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth";
import { Loader2, ChevronLeft, ChevronRight, Star, Check } from "lucide-react";

// Starburst Background Component
const StarburstBackground = () => (
	<div className="absolute inset-0 opacity-10 overflow-hidden">
		<svg
			aria-hidden="true"
			width="120%"
			height="120%"
			viewBox="0 0 500 500"
			preserveAspectRatio="xMidYMid slice"
			className="absolute text-white fill-current -translate-x-1/4 -translate-y-1/4"
		>
			<path
				d="M250,50 L275,180 L400,200 L275,220 L250,350 L225,220 L100,200 L225,180 Z"
				transform="rotate(15 250 250) scale(1.5)"
			/>
			<path
				d="M250,50 L275,180 L400,200 L275,220 L250,350 L225,220 L100,200 L225,180 Z"
				transform="rotate(-15 250 250) scale(1.2) opacity(0.7)"
			/>
		</svg>
	</div>
);

export default function Login() {
	const [, navigate] = useLocation();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const { isLoading: isAuthLoading } = useRedirectIfAuthenticated();

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			const { user, error } = await signInWithGoogle();
			if (error) {
				toast({
					variant: "destructive",
					title: "Authentication error",
					description:
						error.message || "An error occurred during authentication",
				});
				return;
			}
			if (user) {
				toast({
					title: "Successfully logged in",
					description: "Welcome to Habu!",
				});
				// navigate("/dashboard", { replace: true });
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Authentication error",
				description: "An unexpected error occurred. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black">
				<Loader2 className="h-12 w-12 animate-spin text-[#FFCC66]" />
			</div>
		);
	}

	return (
		<>
			{/* SVG Definition for the right panel's unique shape with precise cuts */}
			<svg aria-hidden="true" width="0" height="0" className="absolute">
				<defs>
					<clipPath id="rightPanelShape" clipPathUnits="objectBoundingBox">
						<path d="M0.05,0 C0.022,0 0,0.022 0,0.05 V0.95 C0,0.978 0.022,1 0.05,1 H0.95 C0.978,1 1,0.978 1,0.95 V0.35 C1,0.325 0.985,0.3 0.96,0.3 H0.88 C0.85,0.3 0.835,0.285 0.835,0.26 V0.18 C0.835,0.155 0.82,0.14 0.795,0.14 H0.73 C0.705,0.14 0.69,0.125 0.69,0.1 V0.05 C0.69,0.022 0.668,0 0.64,0 H0.05 Z" />
					</clipPath>
				</defs>
			</svg>

			{/* Center glow effect */}
			<div className="fixed inset-0 pointer-events-none z-0 opacity-70">
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1200px] h-[30vh] bg-gradient-to-r from-[#FF9F5A]/30 via-[#FFCC66]/40 to-[#FF9F5A]/30 rounded-full blur-[100px] animate-pulse" />
				<div
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] max-w-[800px] h-[15vh] bg-gradient-to-r from-[#FF9F5A]/20 via-[#FFCC66]/30 to-[#FF9F5A]/20 rounded-full blur-[80px] animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
			</div>

			<div className="min-h-screen flex bg-black text-white font-sans relative z-10">
				{/* Left Panel */}
				<div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 xl:p-24 relative">
					<div className="relative z-10 w-full max-w-sm">
						<img src="/logo.svg" alt="Habu Logo" className="w-40 h-auto mb-8" />
						<p className="text-gray-300 mb-8 text-lg">Welcome Back!</p>

						{/* Feature Highlights Instead of Form Fields */}
						<div className="mb-12 space-y-6">
							<div className="flex items-start space-x-3">
								<div className="bg-gradient-to-r from-[#ff4800] to-[#ff6000] p-2 rounded-full">
									<Check className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-white font-medium">Instant Access</h3>
									<p className="text-gray-400 text-sm">
										Securely sign in with your Google account
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="bg-gradient-to-r from-[#ff4800] to-[#ff6000] p-2 rounded-full">
									<Check className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-white font-medium">
										Streamlined Workflow
									</h3>
									<p className="text-gray-400 text-sm">
										All your tools in one convenient dashboard
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-3">
								<div className="bg-gradient-to-r from-[#ff4800] to-[#ff6000] p-2 rounded-full">
									<Check className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-white font-medium">Enhanced Security</h3>
									<p className="text-gray-400 text-sm">
										Your data is protected with enterprise-level encryption
									</p>
								</div>
							</div>
						</div>

						{/* Google Sign In Button - Prominent and Styled */}
						<button
							type="button"
							onClick={handleGoogleSignIn}
							disabled={isLoading}
							className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3.5 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center text-lg mb-8 group relative overflow-hidden"
						>
							<span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
							{isLoading ? (
								<Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-700" />
							) : (
								<img
									src="/google-logo.png"
									alt="Google Logo"
									width={24}
									height={24}
								/>
							)}
							<span className="ml-2">Sign in with Google</span>
						</button>

						<p className="text-center text-sm text-gray-400">
							<button
								type="button"
								onClick={() => navigate("/register")}
								className="font-medium text-blue-500 underline group relative inline-block"
							>
								<span className="relative z-10">Create an account</span>
							</button>
						</p>
					</div>
				</div>

				<div className="hidden md:flex md:w-1/2 mx-24 items-center justify-center p-4 relative">
					<div
						className="w-full h-[90vh] max-h-[780px] bg-gradient-to-br from-[#ff6d00] to-[#ff7900] text-gray-900 shadow-2xl relative flex flex-col justify-between overflow-hidden"
						style={{ clipPath: "url(#rightPanelShape)" }}
					>
						<StarburstBackground />

						<div className="relative z-10 p-8 md:p-10 lg:p-16 space-y-10">
							<div>
								<h1 className="text-4xl font-bold mb-1 text-white">
									Freelancing
								</h1>
								<h2 className="text-4xl font-bold mb-4 text-white">
									Reimagined.
								</h2>
								<span className="text-7xl font-serif leading-none text-white opacity-80">
									"
								</span>
								<blockquote className="mt-[-3.5rem] ml-8">
									<p className="text-lg text-white opacity-90 mb-8">
										It was never this easy to create and manage your freelancing
										contracts and invoices.
									</p>
									<footer className="font-semibold text-white">
										Mas Parjono
										<span className="block text-sm font-normal opacity-75">
											Freelancer
										</span>
									</footer>
								</blockquote>
								{/* <div className="flex mt-8 space-x-3">
                  <button
                    type="button"
                    className="bg-black/20 hover:bg-black/30 text-white p-3 rounded-full transition-colors shadow"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors shadow"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div> */}
							</div>
						</div>

						<div className="relative flex-1 flex flex-col justify-center p-8 mt-12">
							<img
								src="/loginasset.svg"
								alt="Hero"
								className="w-full h-full"
							/>
              <div className="flex-1 absolute top-20 left-0 mx-16 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">
                    Get your right job and right place apply now
                  </h3>
                  <p className="text-base text-gray-700 mb-6">
                    Be among the first founders to experience the easiest way to
                    start run a business.
                  </p>
                  <div className="flex items-center mt-auto">
                    <div className="flex -space-x-3">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="User 1"
                      />
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User 2"
                      />
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        src="https://randomuser.me/api/portraits/women/65.jpg"
                        alt="User 3"
                      />
                      <span className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-xs font-medium text-white">
                        +2
                      </span>
                    </div>
                  </div>
                </div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
