x = [0.5 0.7 0.9].';
y = [0.5 0.3 0.8].';

%p = polyfit(x, y, 2);

A = [x x.^2];

p = A\y

xx = linspace(0, 1, 100);
yy = polyval([p;0], xx);

figure(10);clf;hold on
plot(x, y, 'ok')
plot(xx,yy,'b-')
