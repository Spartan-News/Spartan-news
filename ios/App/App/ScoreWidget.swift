import ActivityKit
import WidgetKit
import SwiftUI

@main
struct ScoreWidgetBundle: WidgetBundle {
    var body: some Widget {
        ScoreLiveActivity()
    }
}

struct ScoreLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ScoreActivityAttributes.self) { context in
            // Lock Screen UI
            HStack {
                VStack(alignment: .leading) {
                    Text("SPARTANS").font(.caption).bold().foregroundColor(.blue)
                    Text("\(context.state.homeScore)").font(.title).bold()
                }
                Spacer()
                Text(context.state.gameClock)
                    .font(.caption)
                    .padding(6)
                    .background(Color.black.opacity(0.2))
                    .cornerRadius(6)
                Spacer()
                VStack(alignment: .trailing) {
                    Text("VISITORS").font(.caption).bold().foregroundColor(.gray)
                    Text("\(context.state.awayScore)").font(.title).bold()
                }
            }
            .padding()
            .activityBackgroundTint(Color.slate900)
            .activitySystemActionForegroundColor(Color.white)
            
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Spartans: \(context.state.homeScore)").font(.headline)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Visitors: \(context.state.awayScore)").font(.headline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.gameClock).font(.subheadline)
                }
            } compactLeading: {
                Text("SHS \(context.state.homeScore)")
            } compactTrailing: {
                Text("\(context.state.awayScore)")
            } minimal: {
                Text("🏈")
            }
        }
    }
}