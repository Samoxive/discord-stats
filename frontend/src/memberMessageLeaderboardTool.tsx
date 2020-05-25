import React, { Component, ChangeEvent } from "react";
import { ToolProps } from "./toolPicker";
import { MemberMessageCount, fetchMemberMessageLeaderboard } from "./api";

const ENTRIES_PER_PAGE = 10;

enum TableSort {
    COUNT_DESC,
    COUNT_ASC,
    NAME_DESC,
    NAME_ASC,
}

type MemberMessageLeaderboardToolState = {
    sort: TableSort;
    fromDate: Date;
    toDate: Date;
    pageNumber: number;
    data: MemberMessageCount[] | null;
};

const getInitialState = () => {
    const now = Date.now();
    return {
        sort: TableSort.COUNT_DESC,
        fromDate: new Date(now - 1000 * 60 * 60 * 24 * 7),
        toDate: new Date(now),
        pageNumber: 0,
        data: null,
    };
};

export class MemberMessageLeaderboardTool extends Component<
    ToolProps,
    MemberMessageLeaderboardToolState
> {
    state: MemberMessageLeaderboardToolState = getInitialState();

    componentDidUpdate(previousProps: ToolProps) {
        this.props.guild.id !== previousProps.guild.id &&
            this.setState(getInitialState());
    }

    sortData = (
        data: MemberMessageCount[],
        sort: TableSort
    ): MemberMessageCount[] => {
        data = data.map((x) => x);

        if (sort === TableSort.COUNT_ASC) {
            data.sort((a, b) => a.count - b.count);
        } else if (sort === TableSort.COUNT_DESC) {
            data.sort((a, b) => b.count - a.count);
        } else if (sort === TableSort.NAME_ASC) {
            data.sort((a, b) => -a.member.name.localeCompare(b.member.name));
        } else {
            data.sort((a, b) => a.member.name.localeCompare(b.member.name));
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

    get totalPages() {
        return this.state.data == null
            ? 0
            : Math.ceil(this.state.data.length / ENTRIES_PER_PAGE);
    }

    onPrev = () => {
        this.setState({
            ...this.state,
            pageNumber: Math.max(0, this.state.pageNumber - 1),
        });
    };

    onNext = () => {
        this.setState({
            ...this.state,
            pageNumber: Math.min(
                this.totalPages - 1,
                this.state.pageNumber + 1
            ),
        });
    };

    onFetch = async () => {
        const { guild } = this.props;
        const { fromDate, toDate } = this.state;
        const data = await fetchMemberMessageLeaderboard(
            guild.id,
            (fromDate.getTime() / 1000) | 0,
            (toDate.getTime() / 1000) | 0
        );
        this.setState({ ...this.state, data: data.data });
    };

    render() {
        const { sort, fromDate, toDate, pageNumber, data } = this.state;

        return (
            <div>
                <span>
                    <label htmlFor="memberMessageLeaderboardFromDate">
                        From:
                    </label>
                    <input
                        type="date"
                        id="memberMessageLeaderboardFromDate"
                        onChange={this.onFromDateChange}
                        value={fromDate.toISOString().substr(0, 10)}
                    />
                </span>
                <span>
                    <label htmlFor="memberMessageLeaderboardToDate">To:</label>
                    <input
                        type="date"
                        id="memberMessageLeaderboardToDate"
                        onChange={this.onToDateChange}
                        value={toDate.toISOString().substr(0, 10)}
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
                            {data
                                .slice(
                                    pageNumber * ENTRIES_PER_PAGE,
                                    (pageNumber + 1) * ENTRIES_PER_PAGE
                                )
                                .map(({ member, count }) => (
                                    <tr key={member.id}>
                                        <td
                                            title={
                                                member.nickname ?? member.name
                                            }
                                        >
                                            <span>
                                                <img
                                                    src={
                                                        member.avatarUrl +
                                                        "?size=32"
                                                    }
                                                    style={{
                                                        height: "16px",
                                                        marginRight: "2px",
                                                    }}
                                                    alt=""
                                                />
                                            </span>
                                            {member.name}
                                        </td>
                                        <td>{count}</td>
                                    </tr>
                                ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-evenly",
                                        }}
                                    >
                                        <button onClick={this.onPrev}>
                                            Prev
                                        </button>
                                        {`${pageNumber + 1} / ${
                                            this.totalPages
                                        }`}
                                        <button onClick={this.onNext}>
                                            Next
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : null}
            </div>
        );
    }
}
