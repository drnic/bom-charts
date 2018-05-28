#!/usr/bin/env ruby

require 'json'

# bin/lsalt_boundary_rows.rb 152 -27
# bin/lsalt_boundary_rows.rb 152 -27 1

long_start=ARGV[0].to_f
lat_start=ARGV[1].to_f
degrees=(ARGV[2] || 1).to_i
output=(ARGV[3] || "skyvector")

class Coordinate
	attr_accessor :longitude, :latitude

	def initialize(longitude, latitude)
		self.longitude, self.latitude = longitude, latitude
	end

	def to_skyvector_coords
		north_south = (longitude < 0) ? "S" : "N"
		abs_long = longitude.abs
		long_minutes = ((abs_long - abs_long.to_i) * 60).to_i

		east_west = "E"
		abs_lat = latitude.abs
		lat_minutes = ((abs_lat - abs_lat.to_i) * 60).to_i
		"%d%.2d%s%d%.2d%s" % [abs_long, long_minutes, north_south, abs_lat, lat_minutes, east_west]
	end

	def to_skyvector
		"https://skyvector.com/\?fpl=#{to_skyvector_coords}"
	end
end

class Box < Array
	def to_skyvector
		"https://skyvector.com/\?fpl=#{map(&:to_skyvector_coords).join("%20")}"
	end

	def to_json(options={})
		map do |coord|
			[coord.longitude, coord.latitude]
		end.to_json
	end
end

boxes=[]
long=long_start
while long < long_start + degrees
	lat=lat_start
	while lat < lat_start + degrees
		coord_sequence = [[0,0],[0.5,0],[0.5,0.5],[0,0.5],[0,0]]
		box = coord_sequence.map do |coords|
			Coordinate.new(long + coords[0], lat + coords[1])
		end
		boxes << Box.new(box)

		lat += 0.5
	end
	long += 0.5
end

boxes.each do |box|
	puts "\"#{box.to_json}\",#{box.to_skyvector},"
end