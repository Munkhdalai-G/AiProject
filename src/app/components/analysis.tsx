"use client";
import { TabsContent } from "@/components/ui/tabs";
import { RotateCw, ScrollText, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;

const Analysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.onerror = () => rej(new Error("Read failed"));
        reader.readAsDataURL(file);
      });

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${file.type};base64,${base64}`,
                    },
                  },
                  {
                    type: "text",
                    text: "You are a food expert. Analyze this food photo and identify all the ingredients you can see. List them clearly and provide a brief summary of the dish.",
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "No result.";
      setResult(text);
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="Image analysis" className="">
      <div>
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex text-xl gap-5 items-center">
            <Sparkles />
            Image analysis
          </div>
          <RotateCw className="border cursor-pointer" onClick={handleReset} />
        </div>

        {/* Input section */}
        <p className="text-xl text-gray-400 pt-10">
          Upload a food photo, and AI will detect the ingredients.
        </p>
        <div>
          <input
            ref={fileInputRef}
            className="border w-full h-12 p-2"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 rounded-xl object-cover w-full max-h-60"
            />
          )}
          <div className="w-full flex justify-end">
            <button
              onClick={generateAnalysis}
              disabled={loading || !file}
              className="mt-3 border w-30 h-10 rounded-xl bg-gray-400 text-white disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Result section */}
        <h1 className="flex gap-5 text-2xl items-center mt-4">
          <ScrollText className="h-10" />
          Here is the summary
        </h1>

        {loading && (
          <p className="text-gray-400 text-xl animate-pulse">
            Analyzing your image...
          </p>
        )}

        {!loading && result ? (
          <p className="text-gray-700 text-base whitespace-pre-wrap">
            {result}
          </p>
        ) : (
          !loading && (
            <p className="text-gray-400 text-xl">
              First, enter your image to recognize ingredients.
            </p>
          )
        )}
      </div>
    </TabsContent>
  );
};

export default Analysis;
