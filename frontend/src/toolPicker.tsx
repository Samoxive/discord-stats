import React, { Component, ChangeEvent } from "react";
import { Guild } from "./api";
import { ChannelMessageStatisticsTool } from "./channelMessageStatisticsTool";

const ToolNotSelected = (props: any) => <></>;

export type ToolProps = {
    guild: Guild;
};

enum Tool {
    CHANNEL_MESSAGE_STATISTICS = "1",
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
                </select>
                <ToolComponent guild={this.props.guild} />
            </>
        );
    }
}
