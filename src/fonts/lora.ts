import localFont from "next/font/local";

export const lora = localFont({
	src: [
		{
			path: "./Lora-Variable.woff2",
			style: "normal",
		},
		{
			path: "./Lora-VariableItalic.woff2",
			style: "italic",
		},
	],
	variable: "--font-lora",
	display: "swap",
});
