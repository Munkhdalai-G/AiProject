import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Analysis from "./components/analysis";
import Creator from "./components/creator";
import Ingredient from "./components/ingredient";

export default function Home() {
  return (
    <div className="flex justify-center">
      <div className=" w-200 flex ">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-150">
            <TabsTrigger value="Image analysis">Image analysis</TabsTrigger>
            <TabsTrigger value="Ingredient recognition">
              Ingredient recognition
            </TabsTrigger>
            <TabsTrigger value="Image creator">Image creator</TabsTrigger>
          </TabsList>

          <Analysis />
          <Creator />
          <Ingredient />
        </Tabs>
      </div>
    </div>
  );
}
