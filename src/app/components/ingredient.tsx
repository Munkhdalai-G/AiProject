"use client";
import { TabsContent } from "@/components/ui/tabs";
import { InferenceClient } from "@huggingface/inference";
import { OpenAI } from "openai";
import { RotateCw, ScrollText, Sparkles } from "lucide-react";
import { useState } from "react";

const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.NEXT_PUBLIC_HF_TOKEN!,
  dangerouslyAllowBrowser: true,
});
const hfClient = new InferenceClient(process.env.NEXT_PUBLIC_HF_TOKEN!);

const Ingredient = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setText("");
    setResult(null);
    setImage(null);
  };

  const generateIngredients = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setImage(null);

    try {
      // 1. Get ingredients using Kimi-K2.5 via HuggingFace router
      const chatCompletion = await openai.chat.completions.create({
        model: "moonshotai/Kimi-K2.5:novita",
        messages: [
          {
            role: "user",
            content: `You are a food expert. The user described this food: "${text}". Identify and list all the likely ingredients needed to make it. Format them clearly as a list with brief notes if helpful.`,
          },
        ],
      });

      const resultText =
        chatCompletion.choices[0]?.message?.content ?? "No result.";
      setResult(resultText);
    } catch (error) {
      console.error("Text generation failed:", error);
      setResult("Recognition failed. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // 2. Generate food image
      const imageResponse = await hfClient.textToImage({
        provider: "nscale",
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: `A beautiful, realistic photo of ${text}, food photography, high quality`,
        parameters: { num_inference_steps: 5 },
      });

      const imageObjectURL = URL.createObjectURL(
        imageResponse as unknown as Blob,
      );
      setImage(imageObjectURL);
    } catch (error) {
      console.error("Image failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="Ingredient recognition" className="">
      <div>
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex text-xl gap-5 items-center">
            <Sparkles />
            Ingredient recognition
          </div>
          <RotateCw className="border cursor-pointer" onClick={handleReset} />
        </div>

        {/* Input section */}
        <p className="text-xl text-gray-400 pt-10">
          Describe the food, and AI will detect the ingredients and generate an
          image.
        </p>
        <div>
          <input
            className="border w-full h-35 p-2 text-center"
            type="text"
            placeholder="Орц тодорхойлох"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateIngredients()}
          />
          <div className="w-full flex justify-end">
            <button
              onClick={generateIngredients}
              disabled={loading || !text.trim()}
              className="mt-3 border w-30 h-10 rounded-xl bg-gray-400 text-white disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-400 text-xl mt-4 animate-pulse">
            Analyzing ingredients and generating image...
          </p>
        )}

        {/* Result */}
        {!loading && (result || image) && (
          <div className="mt-4 flex flex-col gap-4">
            {image && (
              <img
                src={image}
                alt={text}
                className="rounded-xl object-cover w-full max-h-60"
              />
            )}
            <h1 className="flex gap-5 text-2xl items-center">
              <ScrollText className="h-10" />
              Identified Ingredients
            </h1>
            <p className="text-gray-700 text-base whitespace-pre-wrap">
              {result}
            </p>
          </div>
        )}

        {!result && !image && !loading && (
          <p className="text-gray-400 text-xl mt-4">
            First, enter your text to recognize ingredients.
          </p>
        )}
      </div>
    </TabsContent>
  );
};

export default Ingredient;
