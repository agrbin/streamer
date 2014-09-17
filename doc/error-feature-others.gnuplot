reset
set border linewidth 1.0
set pointsize 1.0 
#set style line 1 lc rgb '#6000ad' pt 7   # square

set grid
#set xtics 0.0001
#set ytics 0.0005

set key left;

set xrange[0:0.02]
set yrange[0:1.5]

set xlabel 'average squared error'
set ylabel 'squared angle deviation from expected [rad]'

set terminal png
set output 'error-feature-others.png'

# Plot some points 
plot 'feature.dat' using 1:2 title "Error vector"  w p


