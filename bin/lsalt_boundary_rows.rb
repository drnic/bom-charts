#!/usr/bin/env ruby

require 'json'

# bin/lsalt_boundary_rows.rb -27 152
# bin/lsalt_boundary_rows.rb -27 152 | sed -e "s/,/%20/g" | sed -e "s|^|https://skyvector.com/\?fpl\=|"

long_start=ARGV[0].to_f
lat_start=ARGV[1].to_f

class Coordinate
	attr_accessor :longitude, :latitude

	def initialize(longitude, latitude)
		self.longitude, self.latitude = longitude, latitude
	end

	def to_skyvector
		north_south = (longitude < 0) ? "S" : "N"
		abs_long = longitude.abs
		long_minutes = ((abs_long - abs_long.to_i) * 60).to_i

		east_west = "E"
		abs_lat = latitude.abs
		lat_minutes = ((abs_lat - abs_lat.to_i) * 60).to_i
		"%d%.2d%s%d%.2d%s" % [abs_long, long_minutes, north_south, abs_lat, lat_minutes, east_west]
	end

	def to_json(options)
		[longitude, latitude].to_json
	end
end

class Array
	def to_skyvector
		map(&:to_skyvector).join(",")
	end
end

coord_sequence = [[0,0],[0.5,0],[0.5,0.5],[0,0.5]]
coords = coord_sequence.map do |coords|
	Coordinate.new(long_start + coords[0], lat_start + coords[1])
end

puts coords.to_json