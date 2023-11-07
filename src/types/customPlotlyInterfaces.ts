// Custom typing to extend the PlotRelayoutEvent with the expected string date ranges
export interface CustomPlotRelayoutEvent {
    "xaxis.range"?: string[] | undefined;
    "xaxis.autorange"?: boolean | undefined;
}