import ActivityKit
import WidgetKit
import SwiftUI

public struct ScoreActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var homeScore: Int
        var awayScore: Int
        var gameClock: String
    }
    
    // Dynamic attributes
    var gameId: String
}