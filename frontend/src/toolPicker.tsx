import React, { Component, ChangeEvent } from "react";
import { Guild } from "./api";
import { ChannelMessageStatisticsTool } from "./channelMessageStatisticsTool";
import { ChannelMessageLeaderboardTool } from "./channelMessageLeaderboardTool";
import { MemberMessageLeaderboardTool } from "./memberMessageLeaderboardTool";

const ToolNotSelected = (props: any) => <></>;

export type ToolProps = {
    guild: Guild;
};

enum Tool {
    CHANNEL_MESSAGE_STATISTICS = "1",
    CHANNEL_MESSAGE_LEADERBOARD = "2",
    MEMBER_MESSAGE_LEADERBOARD = "3",
}

type ToolPickerProps = {
    guild: Guild;
};

type ToolPickerState = {
    selectedTool?: Tool;
};

function mapToolToComponent(tool?: Tool): typeof Component | null {
    switch (tool) {
        case Tool.CHANNEL_MESSAGE_STATISTICS:
            return ChannelMessageStatisticsTool;
        case Tool.CHANNEL_MESSAGE_LEADERBOARD:
            return ChannelMessageLeaderboardTool;
        case Tool.MEMBER_MESSAGE_LEADERBOARD:
            return MemberMessageLeaderboardTool;
        default:
            return null;
    }
}

export class ToolPicker extends Component<ToolPickerProps, ToolPickerState> {
    state: ToolPickerState = {};

    onToolChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectValue = event.currentTarget.value;

        if (!selectValue) {
            this.setState({ selectedTool: undefined });
        } else {
            this.setState({ selectedTool: selectValue as Tool });
        }
    };

    componentDidUpdate(previousProps: ToolPickerProps) {
        this.props.guild.id !== previousProps.guild.id && this.setState({});
    }

    render() {
        const ToolComponent =
            mapToolToComponent(this.state.selectedTool) ?? ToolNotSelected;

        return (
            <>
                <label htmlFor="toolSelect">Tool: </label>
                <select id="toolSelect" onChange={this.onToolChange}>
                    <option value=""></option>
                    <option value={Tool.CHANNEL_MESSAGE_STATISTICS}>
                        Channel Message Statistics
                    </option>
                    <option value={Tool.CHANNEL_MESSAGE_LEADERBOARD}>
                        Channel Message Leaderboard
                    </option>
                    <option value={Tool.MEMBER_MESSAGE_LEADERBOARD}>
                        Member Message Leaderboard
                    </option>
                </select>
                <ToolComponent guild={this.props.guild} />
            </>
        );
    }
}
