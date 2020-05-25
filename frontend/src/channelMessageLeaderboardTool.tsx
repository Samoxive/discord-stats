import React, { Component, ChangeEvent } from "react";
import { ToolProps } from "./toolPicker";
import { ChannelMessageCount, fetchChannelMessageLeaderboard } from "./api";

enum TableSort {
    COUNT_DESC,
    COUNT_ASC,
    NAME_DESC,
    NAME_ASC,
}

type ChannelMessageLeaderboardToolState = {
    sort: TableSort;
    fromDate: Date;
    toDate: Date;
    data: ChannelMessageCount[] | null;
};

const getInitialState = () => {
    const now = Date.now();
    return {
        sort: TableSort.COUNT_DESC,
        fromDate: new Date(now - 1000 * 60 * 60 * 24 * 7),
        toDate: new Date(now),
        data: null,
    };
};

export class ChannelMessageLeaderboardTool extends Component<ToolProps, {}> {
    state: ChannelMessageLeaderboardToolState = getInitialState();

    componentDidUpdate(previousProps: ToolProps) {
        this.props.guild.id !== previousProps.guild.id &&
            this.setState(getInitialState());
    }

    sortData = (
        data: ChannelMessageCount[],
        sort: TableSort
    ): ChannelMessageCount[] => {
        data = data.map((x) => x);

        if (sort === TableSort.COUNT_ASC) {
            data.sort((a, b) => a.count - b.count);
        } else if (sort === TableSort.COUNT_DESC) {
            data.sort((a, b) => b.count - a.count);
        } else if (sort === TableSort.NAME_ASC) {
            data.sort((a, b) => -a.channel.name.localeCompare(b.channel.name));
        } else {
            data.sort((a, b) => a.channel.name.localeCompare(b.channel.name));
        }

        return data;
    };

    onClickNameHeader = () => {
        const { sort, data } = this.state;
        let newSort: TableSort;
        if (sort === TableSort.COUNT_ASC || sort === TableSort.COUNT_DESC) {
            newSort = TableSort.NAME_ASC;
        } else {
            if (sort === TableSort.NAME_ASC) {
                newSort = TableSort.NAME_DESC;
            } else {
                newSort = TableSort.NAME_ASC;
            }
        }

        this.setState({
            ...this.state,
            sort: newSort,
            data: this.sortData(data!, newSort),
        });
    };

    onClickCountHeader = () => {
        const { sort, data } = this.state;
        let newSort: TableSort;

        if (sort === TableSort.NAME_ASC || sort === TableSort.NAME_DESC) {
            newSort = TableSort.COUNT_DESC;
        } else {
            if (sort === TableSort.COUNT_ASC) {
                newSort = TableSort.COUNT_DESC;
            } else {
                newSort = TableSort.COUNT_ASC;
            }
        }

        this.setState({
            ...this.state,
            sort: newSort,
            data: this.sortData(data!, newSort),
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
        const data = await fetchChannelMessageLeaderboard(
            guild.id,
            (fromDate.getTime() / 1000) | 0,
            (toDate.getTime() / 1000) | 0
        );
        this.setState({ ...this.state, data: data.data });
    };

    render() {
        const { sort, fromDate, toDate, data } = this.state;

        return (
            <div>
                <span>
                    <label htmlFor="channelMessageLeaderboardFromDate">
                        From:
                    </label>
                    <input
                        type="date"
                        id="channelMessageLeaderboardFromDate"
                        onChange={this.onFromDateChange}
                        defaultValue={fromDate.toISOString().substr(0, 10)}
                    />
                </span>
                <span>
                    <label htmlFor="channelMessageLeaderboardToDate">To:</label>
                    <input
                        type="date"
                        id="channelMessageLeaderboardToDate"
                        onChange={this.onToDateChange}
                        defaultValue={toDate.toISOString().substr(0, 10)}
                    />
                </span>
                <button onClick={this.onFetch}>Fetch data!</button>
                {data ? (
                    <table>
                        <thead>
                            <tr>
                                <th onClick={this.onClickNameHeader}>
                                    Name{" "}
                                    {sort === TableSort.NAME_ASC
                                        ? " ↑"
                                        : sort === TableSort.NAME_DESC
                                        ? " ↓"
                                        : ""}
                                </th>
                                <th onClick={this.onClickCountHeader}>
                                    Count{" "}
                                    {sort === TableSort.COUNT_ASC
                                        ? " ↑"
                                        : sort === TableSort.COUNT_DESC
                                        ? " ↓"
                                        : ""}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(({ channel, count }) => (
                                <tr key={channel.id}>
                                    <td>{channel.name}</td>
                                    <td>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : null}
            </div>
        );
    }
}
