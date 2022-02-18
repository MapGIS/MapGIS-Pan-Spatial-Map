<template>
    <div>
        <mapgis-3d-ponding-simulation
            @loaded="loaded"
            @isPonding="
                (e) => {
                    pond = e
                }
            "
            @updateValue="
                (e) => {
                    sliderValue = e
                }
            "
            :pondingTime="pondingTime"
            :multiSpeed="multiSpeed"
        />
        <mp-window-wrapper :visible="showTimeline">
            <template v-slot:default="slotProps">
                <mp-window
                    :visible.sync="showTimeline"
                    title="积水仿真"
                    :horizontal-offset="28"
                    :vertical-offset="30"
                    :width="580"
                    :height="80"
                    :has-padding="false"
                    anchor="bottom-center"
                    v-bind="slotProps"
                >
                    <template>
                        <mapgis-3d-ponding-simulation-timeline
                            :value="sliderValue"
                            :isPlaying="pond"
                            :width="560"
                            :sliderStyle="sliderStyle"
                            @updateTime="
                                (e) => {
                                    pondingTime = e
                                }
                            "
                            @updateSpeed="
                                (e) => {
                                    multiSpeed = e
                                }
                            "
                            @play="addSimulation"
                            style="position:absolute;top:10px;left:10px"
                        />
                    </template>
                </mp-window>
            </template>
        </mp-window-wrapper>
    </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
    name: 'MpPondingSimulation',
})
export default class MpPondingSimulation extends Mixins(WidgetMixin) {

    private pondingTime = 24

    private multiSpeed = 1

    private pond = false

    private sliderValue = 0

    private showTimeline = false

    private sliderStyle = {
        marginLeft: '100px',
        width: '400px'
    }

    /**
     * 微件打开时
     */
    onOpen() {
        this.ponding.mounted()
        this.showTimeline = true
    }

    /**
     * 微件关闭时
     */
    onClose() {
        this.ponding.destroyed()
        this.showTimeline = false

    }

    loaded(ponding) {
        this.ponding = ponding
    }

    addSimulation() {
        this.ponding.addSimulation()
    }
}
</script>

<style lang="less" scoped></style>
