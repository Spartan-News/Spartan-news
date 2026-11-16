import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

@main
struct SpartanLiveActivityBundle: WidgetBundle {
    var body: some Widget {
        SpartanScoreLiveActivity()
    }
}

@available(iOS 16.2, *)
struct SpartanScoreLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            let title = context.attributes.data["title"]?.asString() ?? "Spartan News Score"
            let opponent = context.attributes.data["opponent"]?.asString() ?? "Opponent"
            let spartanScore = context.state.data["spartanScore"]?.asInt() ?? 0
            let opponentScore = context.state.data["opponentScore"]?.asInt() ?? 0
            let clock = context.state.data["clock"]?.asString() ?? "LIVE"

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(title).font(.caption).bold().lineLimit(1)
                    Text("SPARTANS").font(.caption2).foregroundStyle(.blue)
                    Text("\(spartanScore)").font(.title2).bold()
                }
                Spacer(minLength: 4)
                Text(clock).font(.caption).monospacedDigit()
                Spacer(minLength: 4)
                VStack(alignment: .trailing, spacing: 5) {
                    Text(opponent).font(.caption).bold().lineLimit(1)
                    Text("VISITORS").font(.caption2).foregroundStyle(.secondary)
                    Text("\(opponentScore)").font(.title2).bold()
                }
            }
            .padding()
            .activityBackgroundTint(Color(red: 0.02, green: 0.08, blue: 0.20))
            .activitySystemActionForegroundColor(.white)
            .widgetURL(URL(string: "https://shsnews.live/scoreboard"))
        } dynamicIsland: { context in
            let spartanScore = context.state.data["spartanScore"]?.asInt() ?? 0
            let opponentScore = context.state.data["opponentScore"]?.asInt() ?? 0
            let clock = context.state.data["clock"]?.asString() ?? "LIVE"

            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { Text("SHS \(spartanScore)").bold() }
                DynamicIslandExpandedRegion(.trailing) { Text("\(opponentScore) OPP").bold() }
                DynamicIslandExpandedRegion(.bottom) { Text(clock).font(.caption) }
            } compactLeading: {
                Text("SHS \(spartanScore)")
            } compactTrailing: {
                Text("\(opponentScore)")
            } minimal: {
                Text("🏈")
            }
            .widgetURL(URL(string: "https://shsnews.live/scoreboard"))
            .keylineTint(.blue)
        }
    }
}
