/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['your-domain.com', 's3-alpha-sig.figma.com', 'pexels.com', 'images.pexels.com', 'res.cloudinary.com'],
	},
	trailingSlash: false,
	// experimental: {
	// 	serverActions: true, // Enable Next.js App Router server actions (if needed)
	// },
	async headers() {
		return [
			{
				source: '/(.*)', // Apply CORS headers globally
				headers: [
					{
						key: 'Access-Control-Allow-Origin',
						value: '*', // Change to your specific allowed origin for security
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,POST,PUT,DELETE,OPTIONS',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Content-Type, Authorization',
					},
				],
			},
			{ source: '/live/:path*', headers: [
				{ key: 'Permissions-Policy', value: 'camera=*, microphone=*, display-capture=*' }
			]}
		];
	},
};

module.exports = nextConfig;
