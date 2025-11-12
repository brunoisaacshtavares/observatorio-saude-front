import PageHeader from "../components/common/PageHeader";
import ComparativeAnalysisView from "../components/analises/ComparativeAnalysisView";

export default function Analises() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Análises e Tendências"
        description="Compare indicadores de saúde e capacidade hospitalar ao longo do tempo."
      />
      <ComparativeAnalysisView />
    </div>
  );
}