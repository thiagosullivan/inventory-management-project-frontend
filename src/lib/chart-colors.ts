/**
 * Paleta de cores para gráficos.
 * Cores escolhidas para funcionar bem em light e dark theme:
 * - Lightness entre 45% e 65% (contraste em ambos os fundos)
 * - Saturation entre 55% e 75% (vivas mas não neon)
 * - Hue espalhado pelo círculo cromático (máxima distinção visual)
 */
export const CHART_COLORS = [
  "hsl(12, 76%, 61%)", // 1  Coral / Laranja
  "hsl(173, 58%, 45%)", // 2  Verde Esmeralda
  "hsl(217, 65%, 55%)", // 3  Azul Royal
  "hsl(43, 74%, 55%)", // 4  Amarelo Ouro
  "hsl(27, 87%, 60%)", // 5  Laranja Claro
  "hsl(280, 55%, 60%)", // 6  Roxo
  "hsl(340, 70%, 60%)", // 7  Rosa
  "hsl(160, 60%, 45%)", // 8  Verde Água
  "hsl(200, 70%, 50%)", // 9  Azul Céu
  "hsl(90, 50%, 50%)", // 10 Verde Limão
  "hsl(0, 70%, 60%)", // 11 Vermelho
  "hsl(310, 60%, 55%)", // 12 Magenta
  "hsl(240, 60%, 60%)", // 13 Azul Violeta
  "hsl(50, 80%, 55%)", // 14 Amarelo
  "hsl(140, 55%, 45%)", // 15 Verde Musgo
] as const;

/**
 * Retorna a cor associada ao index, ciclando se passar do tamanho da paleta.
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
