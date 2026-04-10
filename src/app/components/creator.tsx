"use client";
import { TabsContent } from "@/components/ui/tabs";
import { InferenceClient } from "@huggingface/inference";
import { Image, RotateCw, Sparkles } from "lucide-react";
import { useState } from "react";

const client = new InferenceClient(process.env.NEXT_PUBLIC_HF_TOKEN!);

const Creator = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setPrompt("");
    setImage(null);
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await client.textToImage({
        provider: "nscale",
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      });

      const imageObjectURL = URL.createObjectURL(response as unknown as Blob);
      setImage(imageObjectURL);
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="Image creator" className="">
      <div>
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex text-xl gap-5">
            <Sparkles />
            Food image creator
          </div>
          <RotateCw className="border cursor-pointer" onClick={handleReset} />
        </div>

        {/* Input section */}
        <p className="text-xl text-gray-400 pt-10">
          What food image do you want? Describe it briefly.
        </p>
        <div>
          <input
            className="border w-full h-35 text-center"
            type="text"
            placeholder="Хоолны тайлбар"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="w-full flex justify-end">
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="mt-3 border w-30 h-10 rounded-xl bg-gray-400 text-white disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Result section */}
        <h1 className="flex gap-5 text-2xl items-center">
          <Image className="h-10" />
          Result
        </h1>

        {image ? (
          <img src={image} width={500} alt="Generated food" />
        ) : (
          <p className="text-gray-400 text-xl">
            First, enter your text to generate an image.
          </p>
        )}
      </div>
    </TabsContent>
  );
};

export default Creator;
