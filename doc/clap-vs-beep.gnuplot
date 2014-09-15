reset
set border linewidth 1.5
set pointsize 1.5
set style line 1 lc rgb '#0060ad' pt 5   # square
set style line 2 lc rgb '#ad6000' pt 7   # circle
set style line 3 lc rgb '#ad6060' pt 7   # triangle

set xtics 50
set ytics 0.1

set grid
set key left;

set xrange[0:210]
set yrange[13.900:14.500]

set xlabel 'time after anomaly [ms]' 
set ylabel 'dominating frequency [Hz]'

set terminal png
set output 'clap-vs-beep.png'

# Plot some points 
plot 'clap.dat' title "A clap" w p ls 1, \
     'beep.dat' title "Sweep beep" w p ls 3

