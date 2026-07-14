<script setup lang="ts">
import type { CountryProfile, HistoricEvent, Language, StylePhase } from '@/data/ww2MusicAtlas'
import { getCountryName, getEventTitle } from '@/lib/atlas'

const props = defineProps<{
  activeYear: number
  isPlaying: boolean
  language: Language
  selectedCountryIds: string[]
  countries: CountryProfile[]
  events: HistoricEvent[]
  highlightedEventId?: string | null
  phases: StylePhase[]
  minYear: number
  maxYear: number
}>()

const emit = defineEmits<{
  'update:year': [year: number]
  'toggle-play': []
  'select-event': [eventId: string]
  'preview-event': [eventId: string | null]
}>()

const totalYears = props.maxYear - props.minYear

function getLeft(year: number) {
  return `${((year - props.minYear) / totalYears) * 100}%`
}

function getWidth(startYear: number, endYear: number) {
  return `${((endYear - startYear) / totalYears) * 100}%`
}

function styleForBand(startYear: number, endYear: number) {
  return {
    left: getLeft(startYear),
    width: getWidth(startYear, endYear),
  }
}

function isPassedEvent(event: HistoricEvent) {
  return event.year <= props.activeYear
}

function isCurrentEvent(event: HistoricEvent) {
  return event.year === props.activeYear
}
</script>

<template>
  <section class="timeline" data-testid="atlas-timeline">
    <div class="tracks">
      <div class="phase-bands">
        <div class="band soft" :style="styleForBand(1931, 1935)">{{ language === 'zh' ? '张力' : 'Tension' }}</div>
        <div class="band hot" :style="styleForBand(1936, 1940)">{{ language === 'zh' ? '扩张' : 'Expansion' }}</div>
        <div class="band smoke" :style="styleForBand(1941, 1943)">{{ language === 'zh' ? '总体战' : 'Total War' }}</div>
        <div class="band light" :style="styleForBand(1944, 1945)">{{ language === 'zh' ? '转折' : 'Turning Point' }}</div>
      </div>

      <div class="phase-lanes">
        <div v-for="countryId in selectedCountryIds" :key="countryId" class="phase-lane">
          <span class="lane-label">
            {{ getCountryName(countries.find((country) => country.id === countryId)!, language) }}
          </span>
          <div class="lane-body">
            <button
              v-for="phase in phases.filter((entry) => entry.countryId === countryId && entry.startYear <= maxYear)"
              :key="`${countryId}-${phase.startYear}`"
              type="button"
              class="phase-span"
              :style="{
                left: getLeft(phase.startYear),
                width: getWidth(phase.startYear, Math.min(phase.endYear + 1, maxYear)),
                '--phase-color': countries.find((country) => country.id === countryId)?.color,
              }"
              @click="emit('update:year', phase.startYear)"
            >
              <span>{{ language === 'zh' ? phase.styleNameZh : phase.styleNameEn }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="event-row">
        <button
          v-for="event in events"
          :key="event.id"
          class="event-pin"
          :class="{
            passed: isPassedEvent(event),
            current: isCurrentEvent(event),
            highlighted: highlightedEventId === event.id,
          }"
          type="button"
          :style="{ left: getLeft(event.year) }"
          :title="getEventTitle(event, language)"
          @blur="emit('preview-event', null)"
          @click="emit('select-event', event.id)"
          @focus="emit('preview-event', event.id)"
          @pointerenter="emit('preview-event', event.id)"
          @pointerleave="emit('preview-event', null)"
        >
          <span class="pin-dot" />
          <span class="pin-label">{{ getEventTitle(event, language) }}</span>
        </button>
      </div>
    </div>

    <div class="scrubber">
      <button class="play-button" type="button" data-testid="timeline-play" @click="emit('toggle-play')">
        {{ isPlaying ? (language === 'zh' ? '暂停' : 'Pause') : language === 'zh' ? '播放' : 'Play' }}
      </button>

      <div class="range-wrap">
        <label class="year-readout" for="timeline-range">{{ activeYear }}</label>
        <input
          id="timeline-range"
          data-testid="timeline-range"
          class="range"
          type="range"
          :min="minYear"
          :max="maxYear"
          :value="activeYear"
          @input="emit('update:year', Number(($event.target as HTMLInputElement).value))"
        />
        <div class="year-scale">
          <span>{{ minYear }}</span>
          <span>{{ maxYear }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  display: grid;
  gap: 1rem;
  padding: 1.1rem 1.2rem 1.2rem;
  background: linear-gradient(180deg, rgba(9, 14, 21, 0.84), rgba(9, 14, 21, 0.68));
  border-top: 1px solid var(--atlas-line);
  backdrop-filter: blur(22px);
}

.tracks {
  position: relative;
  display: grid;
  gap: 0.9rem;
}

.phase-bands,
.event-row,
.lane-body {
  position: relative;
}

.phase-bands {
  height: 2rem;
}

.band {
  position: absolute;
  top: 0;
  bottom: 0;
  padding-left: 0.5rem;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.soft { background: linear-gradient(90deg, rgba(122, 166, 193, 0.16), rgba(122, 166, 193, 0.06)); }
.hot { background: linear-gradient(90deg, rgba(41, 151, 255, 0.22), rgba(41, 151, 255, 0.08)); }
.smoke { background: linear-gradient(90deg, rgba(208, 103, 77, 0.22), rgba(208, 103, 77, 0.08)); }
.light { background: linear-gradient(90deg, rgba(138, 165, 141, 0.2), rgba(138, 165, 141, 0.08)); }
.dawn { background: linear-gradient(90deg, rgba(148, 180, 199, 0.18), rgba(148, 180, 199, 0.08)); }

.phase-lanes {
  display: grid;
  gap: 0.6rem;
}

.phase-lane {
  display: grid;
  grid-template-columns: minmax(6rem, auto) 1fr;
  gap: 0.8rem;
  align-items: center;
}

.lane-label {
  color: var(--atlas-muted);
  font-size: 0.8rem;
}

.lane-body {
  min-height: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.phase-span {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  display: inline-flex;
  align-items: center;
  padding: 0 0.6rem;
  border: 0;
  background: color-mix(in srgb, var(--phase-color) 26%, transparent);
  color: rgba(255, 255, 255, 0.92);
  text-align: left;
  overflow: hidden;
  cursor: pointer;
}

.phase-span span {
  font-size: 0.76rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.event-row {
  min-height: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.event-pin {
  position: absolute;
  top: 0.2rem;
  transform: translateX(-50%);
  background: transparent;
  border: 0;
  color: var(--atlas-text);
  cursor: pointer;
}

.event-pin.highlighted {
  z-index: 2;
}

.event-pin.highlighted,
.event-pin:focus-visible,
.event-pin:hover {
  transform: translateX(-50%) translateY(-0.12rem);
}

.pin-dot {
  display: block;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: var(--atlas-accent);
  box-shadow: 0 0 0 0.35rem rgba(41, 151, 255, 0.12);
  transition: background 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.event-pin.passed .pin-dot {
  background: rgba(41, 151, 255, 0.72);
}

.event-pin.current .pin-dot,
.event-pin.highlighted .pin-dot {
  background: #f2c66f;
  box-shadow:
    0 0 0 0.35rem rgba(41, 151, 255, 0.2),
    0 0 1.2rem rgba(124, 192, 255, 0.34);
  transform: scale(1.18);
}

.pin-label {
  display: block;
  margin-top: 0.55rem;
  width: min(10rem, 22vw);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: center;
  transition: color 180ms ease, opacity 180ms ease;
}

.event-pin:not(.highlighted):not(:hover):not(:focus-visible) .pin-label {
  opacity: 0.74;
}

.event-pin.highlighted .pin-label,
.event-pin:hover .pin-label,
.event-pin:focus-visible .pin-label {
  color: rgba(255, 255, 255, 0.94);
  opacity: 1;
}

.scrubber {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.play-button {
  min-width: 5.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(41, 151, 255, 0.32);
  background: rgba(41, 151, 255, 0.1);
  cursor: pointer;
}

.range-wrap {
  flex: 1;
  display: grid;
  gap: 0.45rem;
}

.year-readout {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.range {
  width: 100%;
}

.year-scale {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.75rem;
}

@media (max-width: 980px) {
  .phase-lane {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .pin-label {
    width: min(7rem, 28vw);
  }
}

@media (max-width: 760px) {
  .timeline {
    padding: 0.95rem 1rem 1.15rem;
  }

  .event-row {
    min-height: 4rem;
  }

  .pin-label {
    width: 4.5rem;
    font-size: 0.65rem;
  }

  .scrubber {
    align-items: stretch;
    flex-direction: column;
  }

  .play-button {
    width: 100%;
  }
}
</style>
