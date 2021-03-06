import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { injectIntl, FormattedMessage as T } from "react-intl";
import messages from "./messages";
import {
  yAxisStyle,
  xAxisStyle,
  myTicketsChartSize,
  padding,
  radiusBottom,
  radiusTop
} from "./Styles";

const ChartTooltip = props => {
  const { payload } = props;
  if (
    !payload ||
    payload.length === 0 ||
    !payload[0] ||
    !payload[0].payload ||
    !payload[0].payload.legendName
  ) {
    return null;
  }

  const rowLegend = payload[0].payload.legendName;

  return (
    <div className="chart-tooltip">
      <div className="row-legend">{rowLegend}</div>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="tooltip-line">
          <div className="circle-tooltip" style={{ background: entry.fill }} />
          <T
            id="charts.tooltip.value"
            m="{key}: {value, number, precise-percent}"
            values={{
              key: entry.dataKey,
              value: entry.value / 100
            }}
          />
        </div>
      ))}
    </div>
  );
};

const VoteTimeChart = ({ data, intl }) => {
  const stakeRewardsKey = intl.formatMessage(messages.stakeRewards);
  const stakeFeesKey = intl.formatMessage(messages.stakeFees);
  if (!data) {
    return null;
  }
  const displayData = data.map(s => ({
    name: intl.formatMessage(messages.dayMonthDisplay, { value: s.time }),
    legendName: intl.formatMessage(messages.fullDayDisplay, { value: s.time }),
    [stakeFeesKey]: s.stakeFeesROI * 100,
    [stakeRewardsKey]: s.stakeRewardROI * 100
  }));

  return (
    <LineChart
      stackOffset="sign"
      width={myTicketsChartSize.width}
      height={myTicketsChartSize.height}
      data={displayData}>
      <XAxis dataKey="name" style={yAxisStyle} />
      <YAxis orientation="right" style={xAxisStyle} padding={padding} />
      <Tooltip content={<ChartTooltip />} />
      <Line
        barSize={8}
        dataKey={stakeRewardsKey}
        stackId="a"
        fill="#070408"
        radius={radiusBottom}
      />
      <Line barSize={8} dataKey={stakeFeesKey} stackId="a" fill="#69d5f7" radius={radiusTop} />
    </LineChart>
  );
};

export default injectIntl(VoteTimeChart);
