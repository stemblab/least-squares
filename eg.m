x = [-0.7 -0.5 0.3 0.9].';
%y = [0.5 0.3 0.8].';

f1 = @(x) x;

f2 = @(x) x.^2; #1/2*(3*x.^2-1)

y = 0.4*f1(x) + 0.6*f2(x);


A = [f1(x) f2(x)]

AA = A.'*A;
Ay = A.'*y;

k1 = 0:0.01:1;
k2 = 0:0.01:1;

for m = 1:length(k2)
  for n = 1:length(k1)
    E(m,n) = norm(A*[k1(n);k2(m)]-y);
  end
end

figure(1);clf;hold on

[c, h] = contour(k1, k2, E);
clabel(c, h)

plot(k1, (Ay(1)-AA(1,1)*k1)/AA(1,2))
plot(k1, (Ay(2)-AA(2,1)*k1)/AA(2,2))
#axis([0 1 0 1])


return

cond(AA)

[V, L] = eig(AA)

return


p = A\y

xx = linspace(0, 1, 100);
yy = polyval([p;0], xx);

figure(10);clf;hold on
plot(x, y, 'ok')
plot(xx,yy,'b-')
