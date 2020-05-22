import React, { Component } from "react";
import { fetchGuilds, Guild } from "./api";
import { ToolPicker } from "./toolPicker";

type GuildPickerState = {
    availableGuilds?: Guild[];
    selectedGuild?: Guild;
};

export class GuildPicker extends Component<{}, GuildPickerState> {
    state: GuildPickerState = {
        availableGuilds: undefined,
        selectedGuild: undefined,
    };

    async componentDidMount() {
        const guilds = await fetchGuilds();
        this.setState({ availableGuilds: guilds });
    }

    onGuildSelect = (guild: Guild) => () => {
        this.setState({ ...this.state, selectedGuild: guild });
    };

    onGuildDeselect = () => {
        this.setState({ ...this.state, selectedGuild: undefined });
    };

    render() {
        const { availableGuilds, selectedGuild } = this.state;

        if (availableGuilds == null) {
            return "Loading";
        }

        return (
            <>
                <div>
                    {availableGuilds.map((guild) => (
                        <button
                            key={guild.id}
                            onClick={this.onGuildSelect(guild)}
                            style={
                                guild.id === selectedGuild?.id
                                    ? { borderStyle: "inset" }
                                    : undefined
                            }
                        >
                            {guild.name}
                        </button>
                    ))}
                </div>
                {selectedGuild == null ? (
                    <></>
                ) : (
                    <ToolPicker guild={selectedGuild} />
                )}
            </>
        );
    }
}
