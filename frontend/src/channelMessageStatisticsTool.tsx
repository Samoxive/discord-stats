import React, { Component, ChangeEvent } from "react";
import { ToolProps } from "./toolPicker";
import { fetchMessageStatistics, TextChannel, MessageStatistics } from "./api";
import { Chart } from "react-google-charts";

const CHART_X_LABEL_COUNT = 4;

enum ChannelView {
    ALL = "All",
    TOTAL = "Total",
    CHANNEL = "Channel",
}

type ChannelMessageStatisticsToolState = {
    channelView: ChannelView;
    selectedChannel: TextChannel | null;
    fromDate: Date;
    toDate: Date;
    data: MessageStatistics | null;
};

const getInitialState = () => {
    const now = Date.now();
    return {
        channelView: ChannelView.ALL,
        selectedChannel: null,
        fromDate: new Date(now - 1000 * 60 * 60 * 24 * 7),
        toDate: new Date(now),
        data: null,
    };
};

export class ChannelMessageStatisticsTool extends Component<
    ToolProps,
    ChannelMessageStatisticsToolState
> {
    state: ChannelMessageStatisticsToolState = getInitialState();

    onChannelViewChange = (e: ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            ...this.state,
            channelView: e.currentTarget.value as ChannelView,
        });
    };

    onSelectedChannelChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let selectedChannel: any = this.state.data?.channels.find(
            (channel) => channel.id === e.currentTarget.value
        );
        selectedChannel = selectedChannel == null ? null : selectedChannel;
        this.setState({
            ...this.state,
            selectedChannel,
        });
    };

    onFromDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.valueAsDate!;
        const now = new Date();
        value.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        this.setState({ ...this.state, fromDate: value });
    };

    onToDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.valueAsDate!;
        const now = new Date();
        value.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        this.setState({ ...this.state, toDate: value });
    };

    onFetch = async () => {
        const { guild } = this.props;
        const { fromDate, toDate } = this.state;
        const data = await fetchMessageStatistics(
            guild.id,
            (fromDate.getTime() / 1000) | 0,
            (toDate.getTime() / 1000) | 0
        );
        this.setState({ ...this.state, data });
    };

    componentDidUpdate(previousProps: ToolProps) {
        this.props.guild.id !== previousProps.guild.id &&
            this.setState(getInitialState());
    }

    getChartData(): any[] {
        const { channelView, data } = this.state;
        if (!data) {
            return [];
        }

        const { channels, dataPoints, timePoints } = data;

        switch (channelView) {
            case ChannelView.ALL:
                return [
                    [
                        {
                            type: "date",
                            label: "Time",
                        },
                        ...channels
                            .map((channel) => [
                                channel.name,
                                {
                                    type: "string",
                                    role: "tooltip",
                                    p: { html: true },
                                },
                            ])
                            .flat(),
                    ],
                    ...timePoints.map((time, i) => {
                        let timePointDate = new Date(time * 1000);
                        return [
                            timePointDate,
                            ...dataPoints[i]
                                .map((dataPoint, j) => [
                                    dataPoint,
                                    `<b>${
                                        channels[j].name
                                    }:</b> ${dataPoint}<br>${timePointDate.toUTCString()}`,
                                ])
                                .flat(), // potential xss vulnerability, we don't care as this is a self-service tool
                        ];
                    }),
                ];
            case ChannelView.CHANNEL:
                let { selectedChannel } = this.state;

                let channelIdx = channels.findIndex(
                    (channel) => channel.id === selectedChannel?.id
                );

                if (channelIdx < 0) {
                    selectedChannel = channels[0];
                    channelIdx = 0;
                }

                return [
                    [
                        { type: "date", label: "Time" },
                        selectedChannel!.name,
                        {
                            type: "string",
                            role: "tooltip",
                            p: { html: true },
                        },
                    ],
                    ...timePoints.map((time, i) => {
                        let timePointDate = new Date(time * 1000);
                        return [
                            timePointDate,
                            dataPoints[i][channelIdx],
                            `<b>${
                                selectedChannel?.name
                            }:</b> ${time}<br>${timePointDate.toUTCString()}`,
                        ];
                    }),
                ];
            case ChannelView.TOTAL:
                return [
                    [
                        { type: "date", label: "Time" },
                        "Total",
                        {
                            type: "string",
                            role: "tooltip",
                            p: { html: true },
                        },
                    ],
                    ...timePoints.map((time, i) => {
                        let timePointDate = new Date(time * 1000);
                        let dataPoint = dataPoints[i].reduce(
                            (acc, elem) => acc + elem,
                            0
                        );

                        return [
                            timePointDate,
                            dataPoint,
                            `<b>Total:</b> ${dataPoint}<br>${timePointDate.toUTCString()}`,
                        ];
                    }),
                ];
            default:
                return [];
        }
    }

    render() {
        const {
            data,
            channelView,
            selectedChannel,
            fromDate,
            toDate,
        } = this.state;

        return (
            <div>
                <span>
                    <label htmlFor="channelMessageStatisticsFromDate">
                        From:
                    </label>
                    <input
                        type="date"
                        id="channelMessageStatisticsFromDate"
                        onChange={this.onFromDateChange}
                        value={fromDate.toISOString().substr(0, 10)}
                    />
                </span>
                <span>
                    <label htmlFor="channelMessageStatisticsToDate">To:</label>
                    <input
                        type="date"
                        id="channelMessageStatisticsToDate"
                        onChange={this.onToDateChange}
                        value={toDate.toISOString().substr(0, 10)}
                    />
                </span>
                <button onClick={this.onFetch}>Fetch data!</button>
                {data ? (
                    <select onChange={this.onChannelViewChange}>
                        <option value={ChannelView.ALL}>All</option>
                        <option value={ChannelView.TOTAL}>Total</option>
                        <option value={ChannelView.CHANNEL}>Channel</option>
                    </select>
                ) : null}
                {channelView === ChannelView.CHANNEL ? (
                    <select
                        onChange={this.onSelectedChannelChange}
                        value={selectedChannel?.id}
                    >
                        <option></option>
                        {data?.channels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name}
                            </option>
                        ))}
                    </select>
                ) : null}
                {data ? (
                    <Chart
                        chartType="LineChart"
                        data={this.getChartData()}
                        options={{
                            hAxis: {
                                format: "ccc LLL dd yyyy HH:mm",
                                slantedText: true,
                                slantedTextAngle: 30,
                                ticks: Array(CHART_X_LABEL_COUNT)
                                    .fill(undefined)
                                    .map((elem, i) => {
                                        const timeDelta =
                                            data.timePoints[
                                                data.timePoints.length - 1
                                            ] - data.timePoints[0];
                                        const timeDeltaBetweenPoints =
                                            (timeDelta / CHART_X_LABEL_COUNT) |
                                            0;
                                        return new Date(
                                            (data.timePoints[0] +
                                                timeDeltaBetweenPoints * i) *
                                                1000
                                        );
                                    }),
                            },
                            tooltip: { isHtml: true, trigger: "visible" },
                        }}
                        width="100%"
                        height="800px"
                    />
                ) : null}
            </div>
        );
    }
}
